import { useState,useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Overview } from './components/overview'
import { RecentSales } from './components/recent-sales'
import { LoadingOverlay } from '@/components/layout/overlay'
import { fetchFromRaftNode } from '@/stub/stub'

export default function Dashboard() {
  const [loading,setLoading] = useState(false)
  return (
    <>
    <LoadingOverlay open={loading}/>
      {/* ===== Top Heading ===== */}
      <Header>
        <TopNav links={topNav} />
        <div className='ml-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Main ===== */}
      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>Dashboard</h1>
          <div className='flex items-center space-x-2'>
            <Button>Download</Button>
          </div>
        </div>
        <Tabs
          orientation='vertical'
          defaultValue='overview'
          className='space-y-4'
        >
          <div className='w-full overflow-x-auto pb-2'>
            <TabsList>
              <TabsTrigger value='overview'>Overview</TabsTrigger>
              <TabsTrigger value='analytics' disabled>
                Analytics
              </TabsTrigger>
              <TabsTrigger value='reports' disabled>
                Reports
              </TabsTrigger>
              <TabsTrigger value='notifications' disabled>
                Notifications
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value='overview' className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              <ActiveUsers setLoading={setLoading}/>
              <GrossWalletTransactions setLoading={setLoading}/>
              <Wallets setLoading={setLoading}/>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Active Now
                  </CardTitle>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    className='text-muted-foreground h-4 w-4'
                  >
                    <path d='M22 12h-4l-3 9L9 3l-3 9H2' />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>+573</div>
                  <p className='text-muted-foreground text-xs'>
                    +201 since last hour
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
              <Card className='col-span-1 lg:col-span-4'>
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent className='pl-2'>
                  <Overview />
                </CardContent>
              </Card>
              <Card className='col-span-1 lg:col-span-3'>
                <RecentSales />
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}

interface LoadingProps {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

function Wallets({setLoading}:LoadingProps){
  const [wallets,setWallets] = useState(0)
  const [walletOperations,setWalletOperations] = useState(0)

  async function fetchData(){
    setLoading(true)
    const d = new Date()
    const {year, month} = getPreviousYearMonth(d)
    const result = await fetchFromRaftNode<{wallet_count:number}>('/api/admin/stats/wallets/count')
    const res = await fetchFromRaftNode<{transaction_count:number}>(`/api/admin/stats/count/transactions/?month=${formatYearMonth(year,month)}`)
    
    if(result.status === 200 && res.status === 200){
      setWallets(result.data.wallet_count)
      setWalletOperations(res.data.transaction_count)
    }
    setLoading(false)
  }
  useEffect(()=>{
    fetchData().then().catch()
  },[])
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium'>Wallets</CardTitle>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='2'
          className='text-muted-foreground h-4 w-4'
        >
          <rect width='20' height='14' x='2' y='5' rx='2' />
          <path d='M2 10h20' />
        </svg>
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold'>{wallets}</div>
        <p className='text-muted-foreground text-xs'>
          {walletOperations} active last month
        </p>
      </CardContent>
    </Card>
  )
}

function GrossWalletTransactions({setLoading}:LoadingProps){
  const [grossSum,setGrossSum] = useState(0)
  const [grossSumPrevMonth,setGrossSumPrevMonth] = useState(0)

  async function fetchData(){
    setLoading(true)
    const date = new Date()
    const {year : prevYear, month: prevMonth} = getPreviousYearMonth(date)
    const response = await fetchFromRaftNode<{total_amount:number}>(`/api/admin/stats/sum/transactions/?month=${formatYearMonth(date.getFullYear(),date.getMonth())}`)
    const prevMonthResponse = await fetchFromRaftNode<{total_amount:number}>(`/api/admin/stats/sum/transactions/?month=${formatYearMonth(prevYear,prevMonth)}`)
    
    if(response.status === 200 && prevMonthResponse.status === 200){
      setGrossSum(response.data.total_amount)
      setGrossSumPrevMonth(prevMonthResponse.data.total_amount)
    }
    setLoading(false)
  }

  useEffect(()=>{
    fetchData().then().catch()
  },[])

  return(
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium'>
          Gross Wallet transactions
        </CardTitle>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='2'
          className='text-muted-foreground h-4 w-4'
        >
          <path d='M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' />
        </svg>
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold'>XAF {grossSum.toLocaleString()}</div>
        <p className='text-muted-foreground text-xs'>
          {grossSumPrevMonth !== 0?((grossSum - grossSumPrevMonth)/grossSumPrevMonth)*100:100}% compared to last month
        </p>
      </CardContent>
    </Card>
  )
}

function ActiveUsers({setLoading}:LoadingProps){
  const [users,setUsers] = useState(0)
  async function fetchData(){
    setLoading(true)
    const response = await fetchFromRaftNode<{active_users:number}>('/api/admin/stats/active-users')
    if(response.status === 200){
      setUsers(response.data.active_users)
    }
    setLoading(false)
  }

  useEffect(()=>{
    fetchData().then().catch()
  },[])

  return(
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>
          Active Users
          </CardTitle>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            className='text-muted-foreground h-4 w-4'
          >
            <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
            <circle cx='9' cy='7' r='4' />
            <path d='M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' />
          </svg>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{users.toLocaleString()}</div>
          <p className='text-muted-foreground text-xs'>
            - joined last month
          </p>
        </CardContent>
      </Card>
  )
}

const topNav = [
  {
    title: 'Overview',
    href: 'dashboard/overview',
    isActive: true,
    disabled: false,
  },
  {
    title: 'Customers',
    href: 'dashboard/customers',
    isActive: false,
    disabled: true,
  },
  {
    title: 'Products',
    href: 'dashboard/products',
    isActive: false,
    disabled: true,
  },
  {
    title: 'Settings',
    href: 'dashboard/settings',
    isActive: false,
    disabled: true,
  },
]

function formatYearMonth(year: number, month: number): string {
  // month is 0-based, so add 1 and pad with leading zero if needed
  const mm = String(month + 1).padStart(2, '0')
  return `${year}-${mm}`
}
function getPreviousYearMonth(date: Date): { year: number; month: number } {
  let year = date.getFullYear()
  let month = date.getMonth() - 1 // Go to previous month
  if (month < 0) {
    month = 11 // December
    year -= 1
  }
  return { year, month }
}