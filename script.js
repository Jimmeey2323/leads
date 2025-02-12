document.addEventListener('DOMContentLoaded', function() {
    const apiUrls = [
        'https://api.momence.com/host/33905/customer-leads',
        'https://api.momence.com/host/13752/customer-leads'
    ];

    async function fetchData(apiUrl, page = 0, pageSize = 200) {
        const response = await fetch(`${apiUrl}?page=${page}&pageSize=${pageSize}&query=`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'include' // Include cookies in the request
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.statusText}`);
        }
        return response.json();
    }

    async function authenticate() {
  try {
    const loginHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    const loginPayload = {
      email: 'jimmeey@physique57india.com',
      password: 'Jimmeey@123'
    };
    const loginOptions = {
      method: 'POST',
      headers: loginHeaders,
      payload: JSON.stringify(loginPayload),
      muteHttpExceptions: true
    };
    const loginResponse = UrlFetchApp.fetch('https://api.momence.com/auth/login', loginOptions);
    if (loginResponse.getResponseCode() !== 200) {
      logError('Authentication failed.');
      return null;
    }
    return loginResponse.getHeaders()['Set-Cookie'];
  } catch (error) {
    logError('An error occurred during authentication: ' + error.message);
    return null;
  }
}

    async function loadTableData() {
        const authenticated = await authenticate();
        if (!authenticated) {
            console.error('Authentication failed.');
            return;
        }

        const tableBody = document.querySelector('#data-table tbody');
        tableBody.innerHTML = ''; // Clear existing data

        for (const apiUrl of apiUrls) {
            let page = 0;
            while (true) {
                try {
                    const data = await fetchData(apiUrl, page);
                    if (!data.payload || data.payload.length === 0) {
                        break;
                    }

                    data.payload.forEach(lead => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${lead.id || '-'}</td>
                            <td>${lead.firstName || '-'}</td>
                            <td>${lead.lastName || '-'}</td>
                            <td>${lead.email || '-'}</td>
                            <td>${formatDate(lead.lastContactedAt) || '-'}</td>
                            <td>${lead.leadHealth || '-'}</td>
                            <td>${formatDate(lead.createdAt) || '-'}</td>
                            <td>${lead.phoneNumber || '-'}</td>
                            <td>${lead.source ? lead.source.name : '-'}</td>
                            <td>${lead.stage ? lead.stage.name : '-'}</td>
                            <td>${lead.memberId || '-'}</td>
                            <td>${formatDate(lead.convertedToCustomerAt) || '-'}</td>
                            <td>${lead.customerLeadHandler ? `${lead.customerLeadHandler.firstName} ${lead.customerLeadHandler.lastName}` : '-'}</td>
                            <td>${lead.additionalFields[795] || lead.additionalFields[707] || '-'}</td>
                            <td>${lead.additionalFields[796] || lead.additionalFields[708] || '-'}</td>
                            <td>${lead.additionalFields[797] || lead.additionalFields[747] || '-'}</td>
                            <td>${lead.additionalFields[798] || lead.additionalFields[748] || '-'}</td>
                            <td>${lead.additionalFields[700] || lead.additionalFields[749] || '-'}</td>
                            <td>${lead.additionalFields[800] || lead.additionalFields[750] || '-'}</td>
                            <td>${lead.additionalFields[801] || lead.additionalFields[751] || '-'}</td>
                            <td>${lead.additionalFields[802] || lead.additionalFields[752] || '-'}</td>
                            <td>${lead.additionalFields[807] || lead.additionalFields[771] || '-'}</td>
                            <td>${lead.additionalFields[808] || lead.additionalFields[772] || '-'}</td>
                            <td>${lead.additionalFields[948] || lead.additionalFields[840] || '-'}</td>
                        `;
                        tableBody.appendChild(row);
                    });

                    page++;
                } catch (error) {
                    console.error('Error fetching data:', error);
                    break;
                }
            }
        }
    }

    function formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB');
    }

    loadTableData();
});
