// test/test.js
const { ProductMatcher, Product, ProductType, Size } = require('../productMatcher');

function runTests() {
    console.log('Starting product matcher tests...');
    
    // Create matcher instance
    const matcher = new ProductMatcher();
    
    // Test data
    const testProducts = [
        new Product({
            id: "M001",
            name: "Test Mattress",
            type: ProductType.MATTRESS,
            size: Size.QUEEN,
            material: "Memory Foam",
            price: 999.99,
            sku: "TEST-MAT-001",
            attributes: { height: 12 }
        }),
        new Product({
            id: "B001",
            name: "Test Bed Frame",
            type: ProductType.BEDFRAME,
            size: Size.QUEEN,
            material: "Wood",
            price: 499.99,
            sku: "TEST-BED-001",
            attributes: { color: "brown" }
        })
    ];
    
    // Add products
    console.log('\nTesting product addition...');
    testProducts.forEach(product => {
        matcher.addProduct(product);
    });
    
    // Test matching
    console.log('\nTesting product matching...');
    const mattress = testProducts[0];
    const matches = matcher.findCompatibleProducts(mattress);
    
    console.log('\nMatching results:');
    matches.forEach((products, type) => {
        console.log(`\nMatches for ${type}:`);
        products.forEach(product => {
            console.log(`- ${product.name} (${product.sku})`);
        });
    });
    
    console.log('\nAll tests completed!');
}

runTests();