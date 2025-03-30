import PawListItem from "./paw-list-item/PawListItem";
import useFetch from "../../hooks/useFetch";

export default function PawsList() {
const url = 'http://localhost:3030/jsonstore/paws';

const [pending, paws] = useFetch(url, [])
    
   return (
        <div className="our-products">
        <div className="container">
            <div className="products-gallery">
                <h2>MISSING PAWS</h2>

            {pending ? <h1>Loading...</h1> : paws.length > 0 ? paws.map(paw => <PawListItem key={paw._id} {...paw} />) : <h3 className="empty-list">Empty list of Paws</h3>}

                <div className="clearfix"></div>
            </div>
        </div>
    </div>
    );
}