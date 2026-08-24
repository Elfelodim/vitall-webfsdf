import Link from 'next/link';
import ProductList from '@/components/inventory/ProductList';
import BulkImportButton from '@/components/inventory/BulkImportButton';
import { inventoryService } from '@/lib/services/inventoryService';

export default async function InventoryPage() {
    const products = await inventoryService.getProducts();

    const lowStockCount = products.filter(p => p.currentStock <= p.minStock).length;
    const totalItems = products.length;

    return (
        <div className="inventory-page">
            <div className="page-header">
                <h1 className="page-title">Gestión de Inventario</h1>
                <p className="page-subtitle">Control de medicamentos e insumos médicos.</p>
            </div>

            <div className="stats-row">
                <div className="stat-card">
                    <span className="stat-value">{totalItems}</span>
                    <span className="stat-label">Total Referencias</span>
                </div>
                <div className="stat-card" style={{ borderColor: lowStockCount > 0 ? 'var(--accent-color)' : '' }}>
                    <span className="stat-value" style={{ color: lowStockCount > 0 ? 'var(--accent-color)' : '' }}>{lowStockCount}</span>
                    <span className="stat-label">Bajo Stock</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value">$12.5M</span>
                    <span className="stat-label">Valor Inventario</span>
                </div>
            </div>

            <div className="inventory-content">
                <div className="toolbar" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <BulkImportButton />
                    <Link href="/inventory/new">
                        <button className="btn btn-primary">+ Nuevo Producto</button>
                    </Link>
                </div>
                <ProductList products={products} />
            </div>
        </div>
    );
}
