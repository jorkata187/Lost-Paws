import { useEffect, useState } from "react";

import petService from "../../services/pawService";

import PawListItem from "./paw-list-item/PawListItem";
import pawService from "../../services/pawService";

export default function PawsList() {
    const [pets, setPets] = useState([]);

    useEffect(() => {
        pawService.getAll()
            .then(setPets)
    }, []);
    
   return (
        <div className="our-products">
        <div className="container">
            <div className="products-gallery">
                <h2>MISSING PAWS</h2>

               {pets.map(pet => <PawListItem key={pet._id} {...pet} />)}
            
                <div className="clearfix"></div>
            </div>
        </div>
    </div>
    );
}