/**
 * Simple CSV to Object Array Parser
 * Handles basic comma-separated values with quoted strings
 */
function parseCSV(csvText) {
    const rows = [];
    let currentRow = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < csvText.length; i++) {
        const char = csvText[i];
        const nextChar = csvText[i + 1];

        if (char === '"' && inQuotes && nextChar === '"') {
            currentField += '"';
            i++; // Skip next quote
        } else if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            currentRow.push(currentField.trim());
            currentField = '';
        } else if ((char === '\r' || char === '\n') && !inQuotes) {
            if (currentField || currentRow.length > 0) {
                currentRow.push(currentField.trim());
                rows.push(currentRow);
            }
            currentRow = [];
            currentField = '';
            if (char === '\r' && nextChar === '\n') i++; // Skip \n
        } else {
            currentField += char;
        }
    }
    if (currentField || currentRow.length > 0) {
        currentRow.push(currentField.trim());
        rows.push(currentRow);
    }

    if (rows.length < 2) return [];

    const headers = rows[0];
    return rows.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, index) => {
            obj[header] = row[index] || '';
        });
        return obj;
    });
}

export async function initCV() {
    try {
        // Fetch All Data
        const [profile, positions, education, projects, certifications, courses] = await Promise.all([
            fetch('linkedin/Profile.csv').then(r => r.text()),
            fetch('linkedin/Positions.csv').then(r => r.text()),
            fetch('linkedin/Education.csv').then(r => r.text()),
            fetch('linkedin/Projects.csv').then(r => r.text()),
            fetch('linkedin/Certifications.csv').then(r => r.text()),
            fetch('linkedin/Courses.csv').then(r => r.text())
        ]);

        renderProfile(parseCSV(profile)[0]);
        renderPositions(parseCSV(positions));
        renderEducation(parseCSV(education));
        renderProjects(parseCSV(projects));
        renderCertifications(parseCSV(certifications));
        renderCourses(parseCSV(courses));

    } catch (err) {
        console.error("Error loading CV data:", err);
    }
}

function renderProfile(data) {
    if (!data) return;
    const nameEl = document.getElementById('cv-name-placeholder');
    const summaryEl = document.getElementById('cv-summary-placeholder');

    // Clean up name (remove emojis often found in LinkedIn headlines/names)
    const fullName = `${data['First Name']} ${data['Last Name']}`.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();
    
    if (nameEl) {
        nameEl.innerHTML = `
            ${fullName}
            <a href="https://www.linkedin.com/in/sjefvl" target="_blank" rel="noopener noreferrer" class="cv-branded-link" title="LinkedIn Profile">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
        `;
    }
    if (summaryEl) summaryEl.textContent = data['Summary'];
}

function parseDate(dateStr) {
    if (!dateStr) return new Date();
    // Handle "Apr 2024" or "2024"
    const parts = dateStr.split(' ');
    if (parts.length === 2) {
        return new Date(`${parts[0]} 1, ${parts[1]}`);
    } else if (parts.length === 1 && !isNaN(parts[0])) {
        return new Date(`Jan 1, ${parts[0]}`);
    }
    return new Date(dateStr);
}

function calculateDuration(startStr, endStr) {
    if (!startStr) return '';
    const start = parseDate(startStr);
    const end = endStr ? parseDate(endStr) : new Date();

    let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    // LinkedIn often includes the end month as part of the tenure
    months += 1; 

    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    const parts = [];
    if (years > 0) parts.push(`${years} yr${years > 1 ? 's' : ''}`);
    if (remainingMonths > 0) parts.push(`${remainingMonths} mo${remainingMonths > 1 ? 's' : ''}`);

    return parts.join(' ');
}

function renderPositions(data) {
    const list = document.getElementById('cv-positions-list');
    if (!list) return;

    list.innerHTML = data.map(pos => {
        const duration = calculateDuration(pos['Started On'], pos['Finished On']);
        return `
            <div class="cv-item experience-item">
                <div class="cv-item-header">
                    <div class="cv-date-row">
                        <span class="cv-date">${pos['Started On']} — ${pos['Finished On'] || 'Present'}</span>
                        ${duration ? `<span class="cv-duration">${duration}</span>` : ''}
                    </div>
                    <h3 class="cv-item-title">${pos['Title']}</h3>
                    <h4 class="cv-item-subtitle">${pos['Company Name']}</h4>
                </div>
                <p class="cv-item-description">${pos['Description']}</p>
            </div>
        `;
    }).join('');
}

function renderEducation(data) {
    const list = document.getElementById('cv-education-list');
    if (!list) return;

    list.innerHTML = data.map(edu => `
        <div class="cv-item education-item">
            <div class="cv-date-row">
                <span class="cv-date">${edu['Start Date'] || ''} ${edu['End Date'] ? '— ' + edu['End Date'] : ''}</span>
            </div>
            <h3 class="cv-item-title">${edu['Degree Name'] || 'Education'}</h3>
            <h4 class="cv-item-subtitle">${edu['School Name']}</h4>
        </div>
    `).join('');
}

function renderProjects(data) {
    const list = document.getElementById('cv-projects-list');
    if (!list) return;

    list.innerHTML = data.map(proj => `
        <div class="cv-item project-item">
            <h3 class="cv-item-title">${proj['Title']}</h3>
            <p class="cv-item-description">${proj['Description']}</p>
        </div>
    `).join('');
}

function renderCertifications(data) {
    const list = document.getElementById('cv-certs-list');
    if (!list) return;

    list.innerHTML = data.map(cert => {
        const isLinkedIn = cert['Url']?.includes('linkedin.com');
        const icon = isLinkedIn ? 
            `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>` :
            `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`;

        return `
            <div class="cv-item cert-item">
                <div class="cv-date-row">
                    <span class="cv-date">${cert['Started On']}</span>
                </div>
                <h3 class="cv-item-title">
                    ${cert['Name']}
                    ${cert['Url'] ? `<a href="${cert['Url']}" target="_blank" rel="noopener noreferrer" class="cv-external-link" title="Visit Certificate">${icon}</a>` : ''}
                </h3>
                <h4 class="cv-item-subtitle">${cert['Authority']}</h4>
            </div>
        `;
    }).join('');
}

function renderCourses(data) {
    const list = document.getElementById('cv-courses-list');
    if (!list) return;

    list.innerHTML = data.map(course => {
        const isLinkedIn = course['Number']?.includes('linkedin.com');
        const icon = isLinkedIn ? 
            `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>` :
            `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`;

        return `
            <div class="cv-item course-item compact">
                <h3 class="cv-item-title">
                    ${course['Name']}
                    <a href="${course['Number']}" target="_blank" rel="noopener noreferrer" class="cv-external-link" title="Visit Course">${icon}</a>
                </h3>
            </div>
        `;
    }).join('');
}
