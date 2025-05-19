import Cookies from 'js-cookie';
import {v4 as uuidv4} from 'uuid'

// Raft node port list
const RAFT_NODE_PORTS: ReadonlyArray<string> = ["8001", "8002", "8003"];

// Generic client API response
type ClientAPIResponse<T = object> = {
    data: T;
    status: number;
    message: string;
};

// Raft GET request client
async function fetchFromRaftNode<T = object>(endpoint: string): Promise<ClientAPIResponse<T>> {
    let roundRobinIndex : number = Number(Cookies.get('roundRobinIndex')) || 0
    const targetPort = RAFT_NODE_PORTS[roundRobinIndex];
    const response = await fetch(`http://localhost:${targetPort}${endpoint}`);

    // Update round robin index
    roundRobinIndex = (roundRobinIndex + 1) % RAFT_NODE_PORTS.length;
    Cookies.set('roundRobinIndex',String(roundRobinIndex))
    const responseBody = await response.json();
    
    return {
        status: response.status,
        data: responseBody as T,
        message: responseBody.message,
    };
}

// Random node selector for writes
function getRandomNodeIndex(): number {
  return Math.floor(Math.random() * RAFT_NODE_PORTS.length);
}

// Write response structure
interface WriteResponse {
  status: number;
  body?: object;
  leader?: string;
}

//status of the fetch result of a log prob
type LogEntryStatus = 'pending' | 'success' | 'failed'

interface LogEntry {
  Status: LogEntryStatus;
}

interface LogStatusResponse {
  Entry: LogEntry,
  index: number;
}

// Basic HTTP request abstraction
async function sendHttpRequest(
  method: string,
  url: string,
  body: object
): Promise<Response> {
  return await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function delay(ms:number){
    return new Promise(r =>(setTimeout(r,ms)))
}
// Send write to Raft cluster (with redirect/leader handling)
async function sendWriteRequest(
  method: string,
  endpoint: string,
  payload: object
): Promise<WriteResponse> {
  let leaderIndex = Number(Cookies.get('leader')) || getRandomNodeIndex();
  const buildUrl = (i: number) => `http://localhost:${RAFT_NODE_PORTS[i]}/api${endpoint}`;
  const pollID = uuidv4()
  
  let response = await sendHttpRequest(method, buildUrl(leaderIndex), {...payload,poll_id:pollID});
  
  let responseBody = await response.json();

  // eslint-disable-next-line no-console
  console.log(response)
  if (response.status === 307 || response.status === 308) {
    switch (responseBody.leaderAddress) {
      case '9001': leaderIndex = 0; break;
      case '9002': leaderIndex = 1; break;
      case '9003': leaderIndex = 2; break;
      default:
        return { status: 400, body: { message: 'Invalid leader data' } };
    }

    Cookies.set('leader', String(leaderIndex));
    response = await sendHttpRequest(method, buildUrl(leaderIndex), {...payload,poll_id:pollID});
    responseBody = await response.json();
  }

  if (response.status >= 400) {
    return { status: response.status, body: responseBody };
  }

  // Polling for log commitment
  const maxRetries = 5
  const probingInterval = 8000
  let attempts = 0

  let finalResponse: WriteResponse;
  
  while (attempts<maxRetries) {
    await delay(probingInterval)
    const poll = await fetchFromRaftNode<LogStatusResponse>(`/log?poll_id=${pollID}`);
    // eslint-disable-next-line no-console
    console.log("poll status: ",poll.data.Entry.Status)
    if (poll.data.Entry.Status !== 'pending') {
      if(poll.data.Entry.Status === 'success'){
        finalResponse = { status: 200, body: poll.data };
      }else if(poll.data.Entry.Status === 'failed'){
        finalResponse = { status: 300, body: poll.data };
      }
      attempts+=5
    }else{
      attempts++
    }
  }

  return finalResponse!;
}

export { fetchFromRaftNode, sendWriteRequest };
