import { useEffect, useState } from "react";

import petService from "../../services/pawService";

import PawListItem from "./paw-list-item/PawListItem";
import pawService from "../../services/pawService";

export default function PawsList() {
    const [paws, setPaws] = useState([]);

    useEffect(() => {
        pawService.getAll()
            .then(setPaws)
    }, []);
    
   return (
        <div className="our-products">
        <div className="container">
            <div className="products-gallery">
                <h2>MISSING PAWS</h2>

            {paws.length > 0
                ?  paws.map(paw => <PawListItem key={paw._id} {...paw} />)
                : <h3 className="empty-list">Empty list of Paws</h3>
            }

                <div className="clearfix"></div>
            </div>
        </div>
    </div>
    );
}