"use client";

import { Product } from '@/types/inventory';
import Link from 'next/link';

export default function ProductList({ products }: { products: Product[] }) {
    return (
        <div className="product-list-container card" style={{ padding: 0 }}>
            <table className="patients-table">
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Producto</th>
                        <th>Categoría</th>
                        <th>Stock</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(product => {
                        const isLowStock = product.currentStock <= product.minStock;
                        return (
                            <tr key={product.id}>
                                <td><span className="doc-num">{product.code}</span></td>
                                <td>
                                    <div className="product-name-cell">
                                        <span className="p-name">{product.name}</span>
                                        <span className="p-unit">{product.unit}</span>
                                    </div>
                                </td>
                                <td>{product.category}</td>
                                <td>
                                    <span className={`stock-badge ${isLowStock ? 'low' : 'ok'}`}>
                                        {product.currentStock}
                                    </span>
                                </td>
                                <td>
                                    <span className="status-badge active">{product.status}</span>
                                </td>
                                <td>
                                    <Link href={`/inventory/kardex/${product.id}`}>
                                        <button className="btn-sm">Kardex</button>
                                    </Link>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>


        </div>
    );
}
