document.addEventListener("DOMContentLoaded", function() {
    const leadsTable = document.getElementById('leadsTable').getElementsByTagName('tbody')[0];
    const baseUrls = [
        'https://api.momence.com/host/33905/customer-leads',
        'https://api.momence.com/host/13752/customer-leads'
    ];

    function formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB'); // Format to dd/MM/yyyy
    }

    async function fetchAndCombineLeadsData() {
        let totalRows = 0;
        let cookie = await authenticateAndGetCookie();

        if (!cookie) {
            console.error('Authentication failed.');
            return;
        }

        for (const baseUrl of baseUrls) {
            let page = 0;

            while (true) {
                const apiUrl = `${baseUrl}?page=${page}&pageSize=200&query=`;
                const dataResponse = await fetchDataFromAPI(apiUrl, cookie);

                if (!dataResponse || !dataResponse.payload || dataResponse.payload.length === 0) {
                    console.log('No more data found.');
                    break;
                }

                const newLeads = dataResponse.payload;
                const leadIds = newLeads.map(lead => lead.id);
                const batchData = await fetchDataBatch(leadIds, cookie, baseUrl);

                if (batchData) {
                    for (let i = 0; i < newLeads.length; i++) {
                        const combinedData = { ...newLeads[i], ...batchData[i] };
                        const sourceName = combinedData.source ? combinedData.source.name : '-';
                        const stageName = combinedData.stage ? combinedData.stage.name : '-';
                        const leadHandlerName = combinedData.customerLeadHandler ? `${combinedData.customerLeadHandler.firstName} ${combinedData.customerLeadHandler.lastName}` : '';

                        const additionalFields = {};
                        combinedData.activeFields.forEach(field => {
                            additionalFields[field.customerLeadsField.id] = field.serialized;
                        });

                        const row = leadsTable.insertRow();
                        const cells = [
                            combinedData.id || '-',
                            combinedData.firstName || '-',
                            combinedData.lastName || '-',
                            combinedData.email || '-',
                            formatDate(combinedData.lastContactedAt),
                            combinedData.leadHealth || '-',
                            formatDate(combinedData.createdAt),
                            combinedData.phoneNumber || '-',
                            sourceName,
                            stageName,
                            combinedData.memberId || '-',
                            formatDate(combinedData.convertedToCustomerAt),
                            leadHandlerName,
                            additionalFields[795] || additionalFields[707] || '-',
                            additionalFields[796] || additionalFields[708] || '-',
                            additionalFields[797] || additionalFields[747] || '-',
                            additionalFields[798] || additionalFields[748] || '-',
                            additionalFields[700] || additionalFields[749] || '-',
                            additionalFields[800] || additionalFields[750] || '-',
                            additionalFields[801] || additionalFields[751] || '-',
                            additionalFields[802] || additionalFields[752] || '-',
                            additionalFields[807] || additionalFields[771] || '-',
                            additionalFields[808] || additionalFields[772] || '-',
                            additionalFields[948] || additionalFields[840] || '-'
                        ];

                        cells.forEach(cellData => {
                            const cell = row.insertCell();
                            cell.textContent = cellData;
                        });

                        totalRows++;
                    }
                }

                page++;
            }
        }

        console.log('Total rows inserted: ' + totalRows);
    }

    async function authenticateAndGetCookie() {
        const loginPayload = {
            email: 'jimmeey@physique57india.com',
            password: 'Jimmeey@123'
        };

        try {
            const loginResponse = await fetch('https://api.momence.com/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(loginPayload)
            });

            if (!loginResponse.ok) {
                throw new Error('Authentication failed.');
            }

            const cookie = loginResponse.headers.get('set-cookie');
            return cookie;

        } catch (error) {
            console.error('An error occurred during authentication: ', error.message);
            return null;
        }
    }

    async function fetchDataFromAPI(apiUrl, cookie) {
        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Cookie': cookie
                }
            });

            return await response.json();
        } catch (error) {
            console.error('Error fetching data from API: ', error.message);
            return null;
        }
    }

    async function fetchDataBatch(ids, cookie, baseUrl) {
        const requests = ids.map(id => fetch(`${baseUrl}/${id}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Cookie': cookie
            }
        }));

        try {
            const responses = await Promise.all(requests);
            return await Promise.all(responses.map(response => response.json()));
        } catch (error) {
            console.error('Error fetching batch data: ', error.message);
            return [];
        }
    }

    fetchAndCombineLeadsData();
});
