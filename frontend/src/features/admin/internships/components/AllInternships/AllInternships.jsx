import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import DeleteModal from "../../../../../components/ui/DeleteModal";
import EmptyState from "../../../../../components/ui/EmptyState";

import InternshipCard from "../InternshipsCard";
import InternshipSkeleton from "../InternshipSkeleton";

import {
    getAllInternships,
    deleteInternship
} from "../../../../../services/api/internship.service";

import "./AllInternships.css";


export default function AllInternships() {


    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState(null);

    const fetchInternships = async () => {

        try {
            const res = await getAllInternships();
            setInternships(res.data.internships);
        }
        catch (error) {
            console.log(error);
            toast.error(
                "Failed to load internships"
            );

        }
        finally {
            setLoading(false);
        }

    };

    useEffect(() => {
        queueMicrotask(() => {
            fetchInternships();
        });
    }, []);


    const handleDelete = async (id) => {
        try {
            await deleteInternship(id);
            setInternships(
                prev => prev.filter(
                    item => item._id !== id
                )
            );

            toast.success(
                "Internship deleted successfully"
            );
        }
        catch (error) {
            console.error("Delete failed:", error);

            toast.error(
                "Delete failed"
            );
        }
    };



    return (

        <div
            id="allInternships"
            className="fade-scroll"
        >


            <div id="allInternshipsHeader">

                <h1>
                    All Internships
                </h1>


                <Link
                    to="/admin/internships-form"
                    className="add-internship-btn"
                >
                    + Add Internship
                </Link>


            </div>



            <div id="allInternshipsCards">


                {
                    loading ?

                        <InternshipSkeleton />


                        :

                        internships.length === 0 ?

                            <EmptyState
                                heading="No Internships Yet"
                                paragraph="There are no internships available right now. Add an internship to start offering learning opportunities."
                            />


                            :

                            <InternshipCard

                                internships={internships}

                                onDelete={(id) => setDeleteId(id)}

                            />

                        }
                        <DeleteModal
        
        
                            open={deleteId !== null}
        
        
                            onCancel={() => setDeleteId(null)}
        
        
                            onConfirm={() => {
        
        
                                handleDelete(deleteId);
        
                                setDeleteId(null);
        
        
                            }}
        
        
                        />



            </div>


        </div>


    )

}
