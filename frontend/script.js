document.addEventListener('DOMContentLoaded', () => {
    const addEmployeeBtn = document.getElementById('addEmployeeBtn');
    const employeeFormContainer = document.getElementById('employeeFormContainer');
    const employeeForm = document.getElementById('employeeForm');
    const employeeTableBody = document.getElementById('employeeTableBody');

    addEmployeeBtn.addEventListener('click', () => {
        employeeFormContainer.style.display = 'block';
    });

    employeeForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(employeeForm);
        const payload = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            department: formData.get('department'),
            salary: formData.get('salary')
        };

        try {
            const response = await fetch('https://empman.onrender.com/employees', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                alert('Employee added successfully');
                // Clear form and hide container
                employeeForm.reset();
                employeeFormContainer.style.display = 'none';
                // Reload employees table
                loadEmployees();
            } else {
                const data = await response.json();
                alert(data.message);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    function loadEmployees(pageNumber, itemsPerPage) {
        fetch(`https://empman.onrender.com/employees?page=${pageNumber}&limit=${itemsPerPage}`)
            .then(response => response.json())
            .then(data => {
                employeeTableBody.innerHTML = '';
                data.forEach(employee => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${employee.firstName}</td>
                        <td>${employee.lastName}</td>
                        <td>${employee.email}</td>
                        <td>${employee.department}</td>
                        <td>${employee.salary}</td>
                        <td>
                            <button class="editBtn">Edit</button>
                            <button class="deleteBtn">Delete</button>
                        </td>
                    `;
                    employeeTableBody.appendChild(row);
                });
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
    

    function handlePaginationClick(event) {
        if (event.target.classList.contains('page-link')) {
            currentPage = parseInt(event.target.dataset.pageNumber);
            loadEmployees(currentPage, itemsPerPage);
        }
    }
    
    document.getElementById('pagination').addEventListener('click', handlePaginationClick);

    // Initial load of employees
    function loadEmployeesForsorting() {
        fetch('https://empman.onrender.com/employees')
            .then(response => response.json())
            .then(data => {
                employeesData = data; // Store the original data
                filteredEmployees = data; // Initially, set filtered data to be the same as the original data
                renderEmployees(filteredEmployees);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }


    function renderEmployees(data) {
        const employeeTableBody = document.getElementById('employeeTableBody');
        employeeTableBody.innerHTML = '';
        data.forEach(employee => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${employee.firstName}</td>
                <td>${employee.lastName}</td>
                <td>${employee.email}</td>
                <td>${employee.department}</td>
                <td>${employee.salary}</td>
                <td>
                    <button onclick="editEmployee(${employee.id})">Edit</button>
                    <button onclick="deleteEmployee(${employee.id})">Delete</button>
                </td>
            `;
            employeeTableBody.appendChild(row);
        });
    }

    function applyFilters() {
        const departmentFilter = document.getElementById('departmentFilter').value;
        const nameSearch = document.getElementById('nameSearch').value.toLowerCase();
    
        filteredEmployees = employeesData.filter(employee => {
            const departmentMatch = departmentFilter === '' || employee.department === departmentFilter;
            const nameMatch = employee.firstName.toLowerCase().includes(nameSearch) || employee.lastName.toLowerCase().includes(nameSearch);
            return departmentMatch && nameMatch;
        });
    
        renderEmployees(filteredEmployees);
    }

    
    
    function sortEmployees(property) {
        filteredEmployees.sort((a, b) => {
            if (a[property] < b[property]) {
                return -1;
            }
            if (a[property] > b[property]) {
                return 1;
            }
            return 0;
        });
    
        renderEmployees(filteredEmployees);
    }

    function editEmployee(employeeId) {
        const updatedEmployee = {
            firstName: document.getElementById('editFirstName').value,
            lastName: document.getElementById('editLastName').value,
            email: document.getElementById('editEmail').value,
            department: document.getElementById('editDepartment').value,
            salary: document.getElementById('editSalary').value
        };
    
        fetch(`https://empman.onrender.com/employees/${employeeId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedEmployee)
        })
        .then(response => response.json())
        .then(data => {
            // Update the employee in the frontend
            const index = filteredEmployees.findIndex(emp => emp.id === employeeId);
            if (index !== -1) {
                filteredEmployees[index] = data;
                renderEmployees(filteredEmployees);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
    
    function deleteEmployee(employeeId) {
        fetch(`https://empman.onrender.com/employees/${employeeId}`, {
            method: 'DELETE'
        })
        .then(() => {
            // Delete the employee from the frontend
            filteredEmployees = filteredEmployees.filter(emp => emp.id !== employeeId);
            renderEmployees(filteredEmployees);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
    
    
});
