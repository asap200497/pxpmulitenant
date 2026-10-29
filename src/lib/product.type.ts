export  interface ProductProps {
    id: string;
    table : number;
    name: string;
    description: string;
    originalbanner: string;
    banner: string;
    items:  any[];
    created_at: Date;
    updated_at: Date;
    category_id: string; 

}

