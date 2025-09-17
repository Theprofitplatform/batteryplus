const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Batteries Plus NSW Website Updates\n');
console.log('=' .repeat(50));

// Test files
const files = ['index.html', 'about.html', 'contact.html', 'services.html'];
const testsPerFile = [];

files.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) {
        console.log(`❌ ${file} not found`);
        return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const tests = {
        file: file,
        passed: [],
        failed: []
    };

    // Test 1: Logo image
    if (content.includes('photos/batteries_plus_logo_website.jpg')) {
        tests.passed.push('✓ Logo image correctly referenced');
    } else {
        tests.failed.push('✗ Logo image missing or incorrect');
    }

    // Test 2: Phone number
    if (content.includes('0439 222 665')) {
        tests.passed.push('✓ Phone number updated to 0439 222 665');
    } else {
        tests.failed.push('✗ Phone number not updated');
    }

    // Test 3: Colors
    if (content.includes("'battery-blue': '#002375'")) {
        tests.passed.push('✓ Blue color updated to #002375');
    } else {
        tests.failed.push('✗ Blue color not updated');
    }

    if (content.includes("'battery-red': '#22C55E'")) {
        tests.passed.push('✓ Red changed to green (#22C55E)');
    } else {
        tests.failed.push('✗ Red not changed to green');
    }

    if (content.includes("'battery-yellow': '#FFC107'")) {
        tests.passed.push('✓ Yellow color updated to #FFC107');
    } else {
        tests.failed.push('✗ Yellow color not updated');
    }

    // Test 4: Navigation links
    if (content.includes('href="services.html"')) {
        tests.passed.push('✓ Services link in navigation');
    } else if (file !== 'services.html') {
        tests.failed.push('✗ Services link missing in navigation');
    }

    // Test 5: Free Quote button
    if (content.includes('bg-battery-yellow text-black') && content.includes('Free Quote')) {
        tests.passed.push('✓ Free Quote button styled correctly');
    } else {
        tests.failed.push('✗ Free Quote button styling incorrect');
    }

    testsPerFile.push(tests);
});

// Display results
console.log('\n📊 TEST RESULTS BY FILE:\n');

testsPerFile.forEach(test => {
    console.log(`\n📄 ${test.file.toUpperCase()}`);
    console.log('-'.repeat(40));

    if (test.passed.length > 0) {
        console.log('✅ Passed Tests:');
        test.passed.forEach(p => console.log('  ' + p));
    }

    if (test.failed.length > 0) {
        console.log('❌ Failed Tests:');
        test.failed.forEach(f => console.log('  ' + f));
    }

    console.log(`Score: ${test.passed.length}/${test.passed.length + test.failed.length}`);
});

// Summary
const totalPassed = testsPerFile.reduce((acc, t) => acc + t.passed.length, 0);
const totalFailed = testsPerFile.reduce((acc, t) => acc + t.failed.length, 0);

console.log('\n' + '='.repeat(50));
console.log('📈 OVERALL SUMMARY:');
console.log('='.repeat(50));
console.log(`✅ Total Passed: ${totalPassed}`);
console.log(`❌ Total Failed: ${totalFailed}`);
console.log(`📊 Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);

// Specific content checks
console.log('\n' + '='.repeat(50));
console.log('🔍 SPECIFIC CONTENT VERIFICATION:\n');

// Check index.html for specific sections
const indexPath = path.join(__dirname, 'index.html');
if (fs.existsSync(indexPath)) {
    const indexContent = fs.readFileSync(indexPath, 'utf8');

    console.log('INDEX.HTML:');
    console.log(indexContent.includes('Battery Brands We Supply') ? '✓ Battery brands section present' : '✗ Battery brands section missing');
    console.log(indexContent.includes('photos/bosch logo.png') ? '✓ Bosch logo present' : '✗ Bosch logo missing');
    console.log(indexContent.includes('photos/varta logo.jpg') ? '✓ VARTA logo present' : '✗ VARTA logo missing');
    console.log(indexContent.includes('Customer Reviews Section') || indexContent.includes('What Our Customers Say') ? '✓ Reviews section present' : '✗ Reviews section missing');
    console.log(indexContent.includes('Emergency Battery Service') && indexContent.includes('photos/emergency_vehicle_engine_repair.jpg') ? '✓ Emergency section with background image' : '✗ Emergency section issue');
}

// Check about.html for specific updates
const aboutPath = path.join(__dirname, 'about.html');
if (fs.existsSync(aboutPath)) {
    const aboutContent = fs.readFileSync(aboutPath, 'utf8');

    console.log('\nABOUT.HTML:');
    console.log(!aboutContent.includes('Meet Our Expert Team') ? '✓ Team section removed' : '✗ Team section still present');
    console.log(aboutContent.includes('Our Company Values') ? '✓ Values section added' : '✗ Values section missing');
    console.log(aboutContent.includes('15,000+') && aboutContent.includes('Batteries Installed') ? '✓ Stats updated to 15,000+' : '✗ Stats not updated');
    console.log(!aboutContent.includes('Awards & Recognition') ? '✓ Awards section removed' : '✗ Awards section still present');
}

// Check contact.html
const contactPath = path.join(__dirname, 'contact.html');
if (fs.existsSync(contactPath)) {
    const contactContent = fs.readFileSync(contactPath, 'utf8');

    console.log('\nCONTACT.HTML:');
    console.log(!contactContent.includes('Stay Connected') ? '✓ Stay Connected section removed' : '✗ Stay Connected section still present');
}

// Check services.html
const servicesPath = path.join(__dirname, 'services.html');
if (fs.existsSync(servicesPath)) {
    const servicesContent = fs.readFileSync(servicesPath, 'utf8');

    console.log('\nSERVICES.HTML:');
    console.log(!servicesContent.includes('Service Pricing') ? '✓ Pricing section removed' : '✗ Pricing section still present');
    console.log(servicesContent.includes('bg-battery-blue text-white py-32') ? '✓ Hero section styled like home page' : '✗ Hero section styling different');
    console.log(servicesContent.includes('Why Choose Us') ? '✓ Why Choose Us section present' : '✗ Why Choose Us section missing');
}

console.log('\n' + '='.repeat(50));
console.log('✅ Website testing complete!');