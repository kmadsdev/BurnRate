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
        
def categorizeTransactions(df):
    df['Category'] = 'Uncategorized'
    
    for category, keywords in st.session_state.categories.items():
        if category == 'Uncategorized' or not keywords:
            continue
        
        lowered_keywords = [kw.lower().strip() for kw in keywords]
        for idx, row in df.iterrows():
            details = row['Details'].lower().strip()
            if details in lowered_keywords:
                df.at[idx, 'Category'] = category
        
    return df

# Clean the data, print it and return them as DataFrame
def loadTransactions(file):
    try:
        df = pd.read_csv(file)
        df.columns = [col.strip() for col in df.columns] # Remove spaces
        df['Amount'] = df['Amount'].str.replace(',', '').astype(float) # Turns string values into float
        df['Date'] = pd.to_datetime(df['Date'], format='%d %b %Y') # Turns string dates into datetime
    
        st.write(df.sort_values('Debit/Credit')) # Shows dataframe on streamlit
        return categorizeTransactions(df)
    except Exception as e:
        st.error(f'Error processing file: {str(e)}')
        return None

# 
def categorize():
    print() 
    
def addKeywordToCategory(category, kw):
    kw = kw.strip()
    if kw and kw not in st.session_state.categories[category]:
        st.session_state.categories[category].append[kw]
        saveCategories()
        return True

    return False 

# The actual program
def main():
    st.title('Expense Tracking') # App title
    uploaded_file = st.file_uploader('Upload your transaction file (CSV): ', type=['csv'])

    if uploaded_file is not None:
        df = loadTransactions(uploaded_file)
        
        if df is not None:
            debit_df = df[df['Debit/Credit'] == 'Debit']
            credit_df = df[df['Debit/Credit'] == 'Credit']
            
            st.session_state.debit_df = debit_df.copy()
            st.session_state.credit_df = credit_df.copy()
            
            tab1, tab2 = st.tabs(['Expenses (Debit)', 'Payments (Credit)'])
            with tab1:
                new_category = st.text_input('New category name')
                confirm_button = st.button('Add category')
                
                if confirm_button  and new_category:
                    if new_category not in st.session_state.categories:
                        st.session_state.categories[new_category] = []
                        saveCategories()
                        st.success(f'New category added sucessfully: {new_category}')
                        st.rerun()

                st.subheader('Your Expenses')
                edited_df = st.data_editor(
                    st.session_state.debit_df[['Date', 'Details', 'Amount', 'Category']],
                    column_config={
                        'Date': st.column_config.DateColumn('Date', format='DD/MM/YYYY'),
                        'Amount': st.column_config.NumberColumn('Amount', format='%.2f AED'),
                        'Category': st.column_config.SelectboxColumn(
                            'Category',
                            options=list(st.session_state.categories.keys())
                        )
                    },
                    hide_index=True,
                    use_container_width=True,
                    key='category_editor'
                )
                
                save_button = st.button('Apply changes', type='primary')
                if save_button:
                    for idx, row in edited_df.iterrows():
                        new_category = row['Category']
                        if new_category == st.session_state.debit_df.at[idx, 'Category']:
                            continue
                        details = row['Details']
                        st.session_state.debit_df.at[idx, 'Category'] = new_category
                        addKeywordToCategory(new_category, details)
                
                st.subheader('Expense Summary')
                category_totals = st.session_state \
                    .debit_df.groupby('Category')['Amount'] \
                    .sum() \
                    .reset_index() \
                    .sort_values('Amount', ascending=False)
                
                st.dataframe(
                    category_totals, 
                    column_config={
                        'Amount': st.column_config.NumberColumn('Amount', format='%.2f AED'), # Put the currency automatically here
                    },
                    use_container_width=True,
                    hide_index=True
                )
                
                fig = px.pie(
                    category_totals,
                    values='Amount',
                    names='Category',
                    title='Expenses by Category'
                )
                st.plotly_chart(fig, use_container_width=True)
                
                st.write(category_totals) 
                
            with tab2:
                st.subheader('Payments Summary')
                total_payments = credit_df['Amount'].sum()
                st.metric('Total Payments', f'{total_payments:,.2f} AED') # Put the currency automatically here
                st.write(credit_df)


# Initializing the app
main()