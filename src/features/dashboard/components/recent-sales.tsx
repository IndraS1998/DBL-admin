import {useState,useEffect} from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { fetchFromRaftNode } from '@/stub/stub'
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type transaction = 'transfer' | 'withdraw' | 'deposit'

type WalletOperation = {
  ID: number;
  Type: transaction;
  Amount:number;
  Timestamp: string;
  Status: string;
  Wallet1: number;
  Wallet2: number;
}

export function RecentSales() {
  const [operations,setOperations] = useState<WalletOperation[]>([])
 
  async function fetchData(){
    const payload = await fetchFromRaftNode<{recent_transactions : WalletOperation[]}>('/api/admin/stats/transactions/recent')
  
    if(payload.status == 200){
      setOperations(payload.data.recent_transactions)
    }
  }

  useEffect(()=>{
    fetchData().then(()=>{}).catch(()=>{})
  },[])
  return (
    <>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>
          A total of {operations.length} transactions so far this month.
        </CardDescription>
     </CardHeader>
        <CardContent>
          <div className='space-y-8'>
          {operations.map((operation) =>(
            <OperationHighlight op={operation} key={operation.ID}/>
          ))}
        </div>
      </CardContent>
    </>
  )
}

interface OperationHighlightProps {
  op: WalletOperation;
}

function OperationHighlight({op} : OperationHighlightProps){
  return (
    <div className='flex items-center gap-4'>
      <Avatar className='h-9 w-9'>
       {op.Type === 'deposit' && <AvatarFallback>D</AvatarFallback>}
       {op.Type === 'transfer' && <AvatarFallback>T</AvatarFallback>}
       {op.Type === 'withdraw' && <AvatarFallback>W</AvatarFallback>}
      </Avatar>
      <div className='flex flex-1 flex-wrap items-center justify-between'>
        <div className='space-y-1'>
          <p className='text-sm leading-none font-medium capitalize'>{op.Type}</p>
          <p className='text-muted-foreground text-sm'>
            Wallet ID: {op.Wallet1} {op.Type === 'transfer' && ` -> Wallet ID: ${op.Wallet2}`}
          </p>
        </div>
        <div className='font-medium'>XAF {op.Amount.toLocaleString()}</div>
      </div>
    </div>
  )
}