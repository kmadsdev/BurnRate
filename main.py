import streamlit as st
import pandas as pd
import plotly.express as px
import json
import os

# to run type: streamlit run main.py

# Setting up streamlit
st.set_page_config(page_title="ExpenseTrackingApp", page_icon="💸", layout="wide")

categoryFilePath = 'categories.json'

# Saves categories information into streamlit
if 'categories' not in st.session_state:
    st.session_state.categories = {
        'Uncategorized': [],
    }

# 
if os.path.exists(categoryFilePath):
    with open(categoryFilePath, 'r') as f:
        st.session_state.categories = json.load(f)

# Write the categories into the json file
def saveCategories():
    with open(categoryFilePath, 'w') as f:
        json.dump(st.session_state.categories, f)

# Clean the data, print it and return them as DataFrame
def loadTransactions(file):
    try:
        df = pd.read_csv(file)
        df.columns = [col.strip() for col in df.columns] # Remove spaces
        df['Amount'] = df['Amount'].str.replace(',', '').astype(float) # Turns string values into float
        df['Date'] = pd.to_datetime(df['Date'], format='%d %b %Y') # Turns string dates into datetime
    
        st.write(df.sort_values('Debit/Credit')) # Shows dataframe on streamlit
        return df
    except Exception as e:
        st.error(f'Error processing file: {str(e)}')
        return None

# 
def categorize():
    print() 

# The actual program
def main():
    st.title('Expense Tracking') # App title
    uploaded_file = st.file_uploader('Upload your transaction file (CSV): ', type=['csv'])

    if uploaded_file is not None:
        df = loadTransactions(uploaded_file)
        
        debit_df = df[df['Debit/Credit'] == 'Debit']
        credit_df = df[df['Debit/Credit'] == 'Credit']
        
        tab1, tab2 = st.tabs(['Expenses (Debit)', 'Payments (Credit)'])
        with tab1:
            new_category = st.text_input('New category name')
            confirm_button = st.button('Add category')
            
            if confirm_button  and new_category:
                if new_category not in st.session_state.categories:
                    st.session_state.categories[new_category] = []
                    saveCategories()
                    st.success(f'New category added sucessfully: {new_category}')

            st.write(debit_df)
            
        with tab2:
            st.write(credit_df)


# Initializing the app
main()
