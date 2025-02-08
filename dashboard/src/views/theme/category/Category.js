import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from '../../../config/api.js';
import {
  CTable, CTableHead, CTableBody, CTableRow, CTableHeaderCell, CTableDataCell,
  CButton, CFormInput, CContainer, CRow, CCol, CAlert, CCard, CCardBody, CCardHeader
} from '@coreui/react';

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      if (response.data.success) {
        setCategories(response.data.data);
      } else {
        setError(response.data.error || "Failed to fetch categories");
      }
    } catch (error) {
      setError(error.message || "An error occurred while fetching categories");
    }
  };

  const addCategory = async () => {
    if (!newCategory.trim()) return alert("Category name cannot be empty!");

    try {
      // Send the correct field 'category'
      const response = await axios.post(`${API_URL}/categories`, { category: newCategory });

      if (response.data.success) {
        setCategories([...categories, response.data.data[0]]);
        setNewCategory(''); // Clear the input field after success
      } else {
        alert(response.data.error);
      }
    } catch (error) {
      alert("Error adding category: " + error.message);
    }
  };

  return (
    <CContainer className="mt-4">
      <CCard>
        <CCardHeader>
          <h2>Categories</h2>
        </CCardHeader>
        <CCardBody>
          {/* Error Alert */}
          {error && <CAlert color="danger">{error}</CAlert>}

          {/* Input and Button to Add Category */}
          <CRow className="mb-4">
            <CCol md="8">
              <CFormInput
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter category name"
              />
            </CCol>
            <CCol md="4">
              <CButton color="primary" onClick={addCategory}>
                Add Category
              </CButton>
            </CCol>
          </CRow>

          {/* Display Table */}
          <CTable striped hover bordered>
            <CTableHead color="light">
              <CTableRow>
                <CTableHeaderCell scope="col">ID</CTableHeaderCell>
                <CTableHeaderCell scope="col">Name</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {categories.map((category) => (
                <CTableRow key={category.id}>
                  <CTableDataCell>{category.id}</CTableDataCell>
                  <CTableDataCell>{category.category}</CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
    </CContainer>
  );
};

export default Category;
