$('#cust_report').json2agilereport({"data":data_json,"report_type":"pagination","no_of_rows":25,"div_class":"","halign":horrizontal_alignment,"table_header":"Table Header","callback":x});
option 1 - data 
    accepts - Array of JSON (Mandatory)
option 2 -  report_type
    accepts - pagination (for pagination no_of_rows is the related option)
              lazy_load (for lazy loading no_of_rows is the related option)
              all_rows (for full loading)
    default - lazy_load
Option 3 - no_of_rows 
    accepts - number 
    default - 15 
option 4 - div_class
    accepts - classname to assign the div
option 5 - halign
    accepts - array of string 
    default - left allignment   
option 6 - table_header
    accepts - Header Name for table Header
option 7 - callback
    accepts - callback fubction that executes each time report refreshes
option 8 - sorting
    accepts - boolean               
option 9 - csv_download
    accepts - boolean(default true) 
option 10 - csv_file_name
    accepts - string(default data.csv)   
option 11 - excel download 
    accepts - boolean (default true)
option 12 - excel_file_name
    accepts - string (default data.xlsx)
option 13 - excel_parameter_tab 
    accepts - boolean(default false)
option 14 - excel_parameter_string
    accepts - name=value pairs separated by ","    
option 15 - dtformatcols
    accepts - {'Date':'dd-mon-yyyy'} (column value should be in the format "Date":'2019-12-01') 
    all formats - dd-mm-yyyy,dd/mm/yyyy,mm-dd-yyyy,mm/dd/yyyy,dd/mon/yyyy,dd-mon-yyyy,dd mon yyyy,dd month yyyy,month dd,yyyy
option 16 - numformatcols 
    accepts - {'Number':{"decimals":1,number_prefix:"$"}}; (column value should be in the number format)     
    all formats - number_suffix/number_prefix/decimals
