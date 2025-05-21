import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchFromRaftNode,sendWriteRequest } from '@/stub/stub'
import { Badge } from "@/components/ui/badge";
import Cookies from "js-cookie";
import { toast } from "sonner"
import { LoadingOverlay } from '@/components/layout/overlay'
import { CheckCircle, Eye } from "lucide-react"


type User = {
    UserID: number,
    FirstName: string,
    LastName: string,
    HashedPassword: string,
    Email: string,
    Rating: number,
    DateOfBirth: string,
    IdentificationNumber: string,
    IdentificationImageFront: string,
    IdentificationImageBack: string,
    ValidatedBy: number,
    CreatedAt: string,
    UpdatedAt: string,
    Active: boolean
}


async function viewDetails(id: number){
    //eslint-disable-next-line
    console.log(id)
}

export default function UsersPage() {
    const [users,setUsers] = useState<User[]>([])
    const [loading,setLoading] = useState<boolean>(false)

    async function handleValidation(id: number){
        setLoading(true)
        const admin_id = Cookies.get("AdminID")
        
        const response = await sendWriteRequest("POST",'/admin/validate/user',{
            admin_id:Number(admin_id),
            user_id:id,
        })
        //eslint-disable-next-line
        console.log(response)
        if(response.status===200){
            await fetchData()
            toast.success("Successul activation!.")
        }else{
            toast.error("Some Error occured. Please try again later!")
        }
        setLoading(false)
    }

    async function fetchData(){
        const response = await fetchFromRaftNode<{Users:User[]}>('/api/admin/users')
        
        if(response.status === 200){
            setUsers(response.data.Users)
        }
    }

    useEffect(()=>{
        fetchData().then().catch()
     },[]
    )
    return (
        <div className="p-6 space-y-6">
            <LoadingOverlay open={loading}/>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Accredited</TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {users.map(user => (
                    <TableRow key={user.UserID}>
                    <TableCell>{user.UserID}</TableCell>
                    <TableCell>{user.FirstName} {user.LastName}</TableCell>
                    <TableCell>{user.Email}</TableCell>
                    <TableCell>{user.Rating}</TableCell>
                    <TableCell>
                        <Badge >
                            {user.Active ? "Yes" : "No"}
                        </Badge>
                    </TableCell>
                    <TableCell className="space-x-2">
                        <Button variant='outline' className='space-x-1' onClick={() => viewDetails(user.UserID)}>
                            <Eye className="w-4 h-4 mr-1" />
                            Details
                        </Button>
                        {!user.Active && (
                        <Button className='space-x-1' variant="secondary" onClick={() => handleValidation(user.UserID)}>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Validate
                        </Button>
                        )}
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </div>
    );
}
