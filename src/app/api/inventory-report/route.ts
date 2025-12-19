import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getDb } from '@/lib/mongodb';
import * as XLSX from 'xlsx';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const userId = session.user.id;

    // Fetch products for this user
    const productsCollName = `products_${userId}`;
    const categoriesCollName = `categories_${userId}`;

    const products = await db.collection(productsCollName).find({}).toArray();
    const categories = await db.collection(categoriesCollName).find({}).toArray();

    // Create a category lookup map
    const categoryMap = new Map();
    categories.forEach((cat: any) => {
      if (cat._id && cat.name !== 'Collection Metadata') {
        categoryMap.set(cat._id.toString(), cat.name);
      }
    });

    // Filter out metadata documents and prepare product data
    const productData = products
      .filter((p: any) => p.name !== 'Collection Metadata')
      .map((product: any, index: number) => ({
        '#': index + 1,
        'Product Name': product.name || 'N/A',
        'Description': product.description || 'No description',
        'Category': product.categoryId ? categoryMap.get(product.categoryId.toString()) || 'Unknown' : 'Uncategorized',
        'Units in Stock': product.units ?? 0,
        'Price ($)': product.price ? product.price.toFixed(2) : 'N/A',
        'Total Value ($)': product.price && product.units ? (product.price * product.units).toFixed(2) : 'N/A',
        'Stock Status': getStockStatus(product.units),
        'Created Date': product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A',
        'Last Updated': product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : 'N/A',
      }));

    // Calculate summary statistics
    const totalProducts = productData.length;
    const totalUnits = productData.reduce((sum: number, p: any) => sum + (parseInt(p['Units in Stock']) || 0), 0);
    const totalValue = productData.reduce((sum: number, p: any) => {
      const val = parseFloat(p['Total Value ($)']);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
    const outOfStock = productData.filter((p: any) => p['Stock Status'] === 'Out of Stock').length;
    const lowStock = productData.filter((p: any) => p['Stock Status'] === 'Low Stock').length;
    const wellStocked = productData.filter((p: any) => p['Stock Status'] === 'Well Stocked').length;

    // Create workbook
    const wb = XLSX.utils.book_new();

    // --- Sheet 1: Summary ---
    const summaryData = [
      ['INVENTORY REPORT'],
      ['Generated on:', new Date().toLocaleString()],
      ['User:', session.user.email],
      [''],
      ['SUMMARY STATISTICS'],
      ['Total Products:', totalProducts],
      ['Total Units in Stock:', totalUnits],
      ['Total Inventory Value:', `$${totalValue.toFixed(2)}`],
      [''],
      ['STOCK STATUS BREAKDOWN'],
      ['Well Stocked (10+ units):', wellStocked],
      ['Low Stock (1-9 units):', lowStock],
      ['Out of Stock (0 units):', outOfStock],
      [''],
      ['CATEGORIES'],
      ['Total Categories:', categories.filter((c: any) => c.name !== 'Collection Metadata').length],
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Set column widths for summary
    summarySheet['!cols'] = [{ wch: 25 }, { wch: 30 }];
    
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

    // --- Sheet 2: Products ---
    const productsSheet = XLSX.utils.json_to_sheet(productData);
    
    // Set column widths for products
    productsSheet['!cols'] = [
      { wch: 5 },   // #
      { wch: 25 },  // Product Name
      { wch: 40 },  // Description
      { wch: 15 },  // Category
      { wch: 15 },  // Units in Stock
      { wch: 12 },  // Price
      { wch: 15 },  // Total Value
      { wch: 15 },  // Stock Status
      { wch: 15 },  // Created Date
      { wch: 15 },  // Last Updated
    ];
    
    XLSX.utils.book_append_sheet(wb, productsSheet, 'Products');

    // --- Sheet 3: Categories ---
    const categoryData = categories
      .filter((c: any) => c.name !== 'Collection Metadata')
      .map((cat: any, index: number) => {
        const catProducts = products.filter((p: any) => 
          p.categoryId && p.categoryId.toString() === cat._id.toString() && p.name !== 'Collection Metadata'
        );
        const catUnits = catProducts.reduce((sum: number, p: any) => sum + (p.units || 0), 0);
        const catValue = catProducts.reduce((sum: number, p: any) => sum + ((p.price || 0) * (p.units || 0)), 0);
        
        return {
          '#': index + 1,
          'Category Name': cat.name || 'N/A',
          'Description': cat.description || 'No description',
          'Products Count': catProducts.length,
          'Total Units': catUnits,
          'Total Value ($)': catValue.toFixed(2),
          'Created Date': cat.createdAt ? new Date(cat.createdAt).toLocaleDateString() : 'N/A',
        };
      });

    const categoriesSheet = XLSX.utils.json_to_sheet(categoryData);
    
    // Set column widths for categories
    categoriesSheet['!cols'] = [
      { wch: 5 },   // #
      { wch: 20 },  // Category Name
      { wch: 35 },  // Description
      { wch: 15 },  // Products Count
      { wch: 12 },  // Total Units
      { wch: 15 },  // Total Value
      { wch: 15 },  // Created Date
    ];
    
    XLSX.utils.book_append_sheet(wb, categoriesSheet, 'Categories');

    // --- Sheet 4: Low Stock Alert ---
    const lowStockProducts = productData.filter((p: any) => 
      p['Stock Status'] === 'Out of Stock' || p['Stock Status'] === 'Low Stock'
    );
    
    if (lowStockProducts.length > 0) {
      const lowStockSheet = XLSX.utils.json_to_sheet(lowStockProducts);
      lowStockSheet['!cols'] = productsSheet['!cols'];
      XLSX.utils.book_append_sheet(wb, lowStockSheet, 'Low Stock Alert');
    }

    // Generate buffer
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Create filename with date
    const date = new Date().toISOString().split('T')[0];
    const filename = `inventory-report-${date}.xlsx`;

    // Return the file
    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('Error generating inventory report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}

function getStockStatus(units: number | undefined): string {
  if (units === undefined || units === 0) return 'Out of Stock';
  if (units < 5) return 'Low Stock';
  if (units < 10) return 'Medium Stock';
  return 'Well Stocked';
}
