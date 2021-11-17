# agilereport
# About
This is the lightweight jquery plugin in which you can pass data in json format and it will render the html report with features of pagination/lazyload, column sorting, number/date formatting, in-report record filter,data export and many more customizations.
Please go through this document thoroughly to get used to it.
 
# Usage
  **Step 1** - Please include agilereport.min.js in your script header.
  
  **Step 2** - have one empty html div element in the DOM. ex- <div id="report_container"></div>
  
  **Step 3** - Call jquery function json2agilereport on the selected element.
  
  **$('#report_container').json2agilereport(options);**
  
  Where options is a json with different key value pairs
  
  **Mandatory properties in options**
  1. data : accepts json array as shown below.
  2. table_header : accepts String containing name of the report header.
  ###### Example :
  ```
  const data_json = [{"Name":"ratikanta","Number":40000.654,"Date":'2019-12-01'},{"Name":"Lisha","Number":"","Date":'2019-12-02'}];
  const options = {"data":data_json,"table_header":"Table Header"};
  $('#report_container').json2agilereport(options);
  ```
# Configuring Report
Following are the list of configuration parameters to customize the report.
1.  **data** property(Mandatory) to feed data to the report 
    - accepts : Array of JSON 
    - {data:[{..},{..}..]}   

2. **table_header** property(Mandatory) to set report header
    - accepts : string for report header name
    - default - left allignment  
    
3. **report_type** property to set report type 
    - accepts : 1. "pagination" (for pagination no_of_rows is the related option)
    
                2. "lazy_load" (for lazy loading no_of_rows is the related option)
                
                3. "all_rows" (for full loading)
    - default : "lazy_load"
    
4. **no_of_rows** property to set no of rows per page in case of pagination/ lazy load
    - accepts : number
    - default : 15
    
5. **div_class** property to assing a class to the report div
    - accepts : string having classname to assign the div
        
6. **halign** property to set horezontal allignment of the report
    - accepts : array of string 
    - default : left allignment           

7. **callback** property to do some report manipulation after render/refresh of the report
    - accepts : callback fubction that executes each time report refreshes with data as parameter 

8. **sorting** property to sort the column
    - accepts : boolean
    - default : true
  
9. **csv_download** property to download csv export of the report
    - accepts : boolean
    - default : true  
             
10. **csv_file_name** property the csv file name 
     - accepts : string
     - default : data.csv   

11. **csv_file_name** property the csv file name 
     - accepts : string
     - default : data.csv 
     
12. **excel_download** property to download excel file
     - accepts : boolean
     - default : true

13. **excel_file_name** property to download excel file
     - accepts : string
     - default : data.xlsx
     
14. **excel_file_name** property to provide downloaded excel file name
     - accepts : string
     - default : data.xlsx     
     
15. **excel_parameter_tab** property flag to enable excel parameters tab
     - accepts : boolean
     - default : false
     
16. **excel_parameter_string** property to pass data to parameters tab
     - accepts : name=value pairs separated by "," 
          
17. **dtformatcols** property to format date columns
     - accepts : {column_name:format} (column value should be in the format "Date":'2019-12-01')    
                  ex- {'Date':'dd-mon-yyyy'}
     - all formats : dd-mm-yyyy,dd/mm/yyyy,mm-dd-yyyy,mm/dd/yyyy,dd/mon/yyyy,dd-mon-yyyy,dd mon yyyy,dd month yyyy,month dd,yyyy

18. **numformatcols** property to format number columns
     - accepts : {'Number':{"decimals":1,number_prefix:"$"}}; (column value should be in the number format)   
     - all options : all formats - number_suffix/number_prefix/decimals
