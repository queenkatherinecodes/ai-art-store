const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const DATA_DIR = path.join(__dirname, 'src', 'public', 'data');
const LOG_FILE = 'activity.log';
let globalCookies = null;
let userId = null;

async function runTests() {
    console.log('Starting API tests...');

    // Test user registration
    const registrationResponse = await testEndpoint('POST', '/auth/register', {
        username: 'testuser',
        password: 'testpassword',
        email: 'testuser@example.com'
    }, 'User registration', [201, 409]);

    if (registrationResponse.status === 201) {
        console.log('User registered successfully.');
    } else if (registrationResponse.status === 409) {
        console.log('User already exists, proceeding with login.');
    } else {
        console.error('Registration failed. Cannot proceed with further tests.');
        return;
    }

    // Test user login
    const loginResponse = await testEndpoint('POST', '/auth/login', {
        username: 'testuser',
        password: 'testpassword',
        rememberMe: false
    }, 'User login', [200]);

    if (!loginResponse) {
        console.error('Login failed. Cannot proceed with further tests.');
        return;
    }

    globalCookies = loginResponse.headers.get('set-cookie');
    console.log('Login successful, cookies saved.');

    // Test authentication and get user ID
    const authResponse = await testEndpoint('GET', '/auth/authenticate', null, 'User authentication', [200]);
    if (authResponse) {
        const authData = await authResponse.json();
        userId = authData.user.id;
        console.log(`User ID retrieved: ${userId}`);
    } else {
        console.error('Failed to retrieve user ID. Cannot proceed with further tests.');
        return;
    }

    // Test admin authentication (this should fail for a regular user)
    await testEndpoint('GET', '/auth/authenticate/admin', null, 'Admin authentication', [403]);

    // Test getting products
    const productsResponse = await testEndpoint('GET', '/api/products', null, 'Get all products', [200]);
    let products = [];

    if (productsResponse) {
        products = await productsResponse.json();
        console.log(`Retrieved ${products.length} products.`);
    }

    // Test searching products
    await testEndpoint('GET', '/api/products/search?query=art', null, 'Search products', [200]);

    // Test getting a specific product
    if (products.length > 0) {
        await testEndpoint('GET', `/api/products/${products[0].id}`, null, 'Get specific product', [200]);
    } else {
        console.log('No products available to test getting a specific product.');
    }

    // Test adding item to cart
    if (products.length > 0) {
        await testEndpoint('POST', '/api/cart/add', {
            userId: userId,
            productId: products[0].id,
            quantity: 1
        }, 'Add item to cart', [200]);
    } else {
        console.log('No products available to test adding to cart.');
    }

    // Test getting user's cart
    const cartResponse = await testEndpoint('GET', `/api/cart/${userId}`, null, 'Get user cart', [200]);
    let cart = [];

    if (cartResponse) {
        cart = await cartResponse.json();
        console.log(`User cart contains ${cart.length} items.`);
    }

    // Test removing item from cart
    if (cart.length > 0) {
        await testEndpoint('POST', '/api/cart/remove', {
            userId: userId,
            productId: cart[0].productId
        }, 'Remove item from cart', [200]);
    } else {
        console.log('Cart is empty, cannot test removing item.');
    }

    // Test checkout
    await testEndpoint('POST', '/api/cart/checkout', {
        userId: userId
    }, 'Checkout', [200, 400]);

    // Test getting reviews
    await testEndpoint('GET', '/api/reviews/review', null, 'Get reviews', [200]);

    // Test sending log
    console.log('Preparing to send log...');
    const user = 'testuser'; 
    const activity = 'testactivity';
    
    // Send log request without waiting for response
    fetch(`${BASE_URL}/api/log/send`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': globalCookies
        },
        body: JSON.stringify({user, activity})
    }).then(response => {
        console.log('Log send response status:', response.status);
    }).catch(error => {
        console.error('Error sending log:', error);
    });

    // Wait for 5 seconds
    console.log('Waiting for 5 seconds...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Verify the log entry
    verifyLogEntry(user, activity);


    // Test user logout
    await testEndpoint('POST', '/auth/logout', null, 'User logout', [200]);

    // After logout, clear the global cookies
    globalCookies = null;

    console.log('All tests completed.');
}

async function testEndpoint(method, path, body, testName, expectedStatuses) {
    console.log(`Running test: ${testName}`);

    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (globalCookies) {
        options.headers['Cookie'] = globalCookies;
    }

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${BASE_URL}${path}`, options);

        if (expectedStatuses.includes(response.status)) {
            console.log(`✅ Test passed: ${testName} (Status: ${response.status})`);
            return response;
        } else {
            console.log(`❌ Test failed: ${testName}`);
            console.log(`Expected status ${expectedStatuses.join(' or ')}, but got ${response.status}`);
            const responseBody = await response.text();
            console.log('Response body:', responseBody);
            return null;
        }
    } catch (error) {
        console.error(`❌ Test failed: ${testName}`);
        console.error('Error details:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('Connection refused. Please ensure your server is running and the BASE_URL is correct.');
        }
        return null;
    }
}

function verifyLogEntry(user, activity) {
    console.log('Starting log verification...');
    try {
        console.log('Attempting to read log file...');
        const content = fs.readFileSync(path.join(__dirname, 'src', 'public', 'data', 'activity.log'), 'utf8');
        console.log('Log file read successfully. Content length:', content.length);

        const logLines = content.trim().split('\n');
        console.log('Number of log lines:', logLines.length);

        const lastLogLine = logLines[logLines.length - 1];
        console.log('Last log line:', lastLogLine);

        // Use a regular expression to parse the log entry
        const regex = /^(.*?),([^,]+),([^,]+)$/;
        const match = lastLogLine.match(regex);

        if (match) {
            const [, logDate, logUser, logActivity] = match;

            console.log("Date:", logDate);
            console.log("User:", logUser);
            console.log("Activity:", logActivity);

            console.log('Parsed log entry:', { logUser, logActivity });
            console.log('Expected data:', { user, activity });

            if (logUser.trim() === user.trim() && logActivity.trim() === activity.trim()) {
                console.log('✅ Log entry verified successfully');
            } else {
                console.log('❌ Log entry verification failed');
                console.log('Expected:', { user, activity });
                console.log('Found:', { logUser, logActivity });
            }
        } else {
            console.log('❌ Failed to parse log entry');
            console.log('Log line:', lastLogLine);
        }
    } catch (error) {
        console.error('Error in verifyLogEntry:', error);
    }
    console.log('Log verification completed.');
}

runTests().catch(console.error);