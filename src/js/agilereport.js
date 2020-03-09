"use strict";
(function ( $ ) {
    let agile_data=[],tmp,settings,header_arr=[],html="",rec_control={"psize":0,"srow":"","erow":"","curr_pos":""},Jhxlsx="";
    const mth = ["Jan", "Feb", "Mar","Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const fmth = ["January", "February", "March","April", "May", "June", "July", "August", "September", "Octomber", "November", "December"];
    $.fn.agilereport = function( options ) {
        if(options=='destroy'){destroy.call(this);return;}
        let p_halign=[];
        if(!options.data || options.data.length==0){
          this.html("No Data Found !").addClass('agile_no_data');
          return;
        } 
        for(let i in options.data[0]){
            header_arr.push(i);
            p_halign.push('left');
        }
        // This is the easiest way to have default options.
        settings = $.extend({
            // These are the defaults.
            "div_class":"",
            "halign":p_halign,
            "no_of_rows":15,
            "dtformatcols":{},
            "csv_download":true,
            "csv_file_name":"data.csv",
            "excel_download":true,
            "excel_file_name":"data.xlsx",
            "excel_parameter_tab":false,
            "excel_parameter_string":"",
            "numformatcols":{},
            "sorting":true,
            "report_type":"lazy_load",
            callback: function() {console.log('callback not defined:'+this.innerHTML);}
        }, options );
        rec_control.psize=Number(settings.no_of_rows);
        create_header.call(this);
        agile_data=settings.data;
        gen_report.call(this);
        filter_data_event.call(this);
        $('.json2agilereport').parent('div').css({"width":$('.json2agilereport').css('width'),"margin":"0 auto"});
        $('.json2agilereport table').css('width',$('.json2agilereport table').css('width'));
        settings.callback.call(this);
        if(!Jhxlsx)create_jhxlsx_obj();
        return this;
    };//json2agilereport
    /**************Build Report*********************/
    function gen_report(){
      if(settings.report_type=="lazy_load" || settings.report_type=="pagination"){
          rec_control.srow=1;rec_control.erow=rec_control.psize;
      }else{
          rec_control.srow=1;rec_control.erow=agile_data.length;
      }
      append_rows.call(this);
      if (settings.report_type=="pagination") {
        $('.agile_wrapper').append(`<div class="agile_bottom_tools"><input type="text" value="${rec_control.psize}"><span> rows per page</span><div class="pagination"></div></div>`);
        set_pagination();
        $('.agile_bottom_tools input').change(function(){
          console.log('new row->'+$(this).val());
          rec_control.psize=Number($(this).val());
          agile_data=settings.data;rec_control.srow=1;rec_control.erow=rec_control.psize;
          $('.json2agilereport tbody').html('');
          append_rows.call(this);
          set_pagination();
          settings.callback.call(this);
        });
      }else if(settings.report_type=="lazy_load"){
        $('.json2agilereport').scrollTop(0).scroll(function (event) {
          var self = $(this);
          var lTbl = self.children("table");
          if (self.scrollTop() >= lTbl.height() - self.height()) {
            rec_control.srow=rec_control.curr_pos+1;rec_control.erow=rec_control.curr_pos+rec_control.psize;
            append_rows.call(this);
            settings.callback.call(this);
          }
        });
      }//lazy_load
    }//gen_report
    /**************Build Report*********************/
    function create_header(){
      this.html(`<div class="agile_wrapper">
                <div class="agile_top_tools"><input type="search" placeholder="Search"><ul class="agile_suggest"></ul><div class="agile_down"><ul>${settings.csv_download?'<li class="csv">Download CSV</li>':''}${settings.excel_download?'<li class="excel">Download Excel</li>':''}</ul></div></div>
                <div class="json2agilereport ${settings.div_class}">
                <table>
                  <thead>
                    <tr class=${settings.sorting?'"agile_sort"':'""'}></tr>
                  </thead>
                  <tbody>
                  </tbody>
                </table>
                </div>
                </div>
                `);
      if(!settings.csv_download && !settings.excel_download)$('.agile_down').remove();
      $('.agile_down .csv').click(function(){
        down_csv();
      });
      $('.agile_down .excel').click(function(){
        json2excel();
      });        
      if( settings.table_header )$('.agile_wrapper').prepend(`<div class="theader">${settings.table_header}</div>`);
      header_arr.forEach(function(a,i){$('.json2agilereport thead tr').append(`<th align="${settings.halign[i]}" data-key="${a}">${a}</th>`)});
      if(settings.sorting)enable_sort();
    }//create_header
    function append_rows(){
      if ( agile_data.length < rec_control.srow ) return ;
      rec_control.erow = (agile_data.length < rec_control.erow)?agile_data.length:rec_control.erow;
      console.log('start->'+rec_control.srow);
      console.log('End->'+rec_control.erow);
      //prepare tbody  
      for(let j=(rec_control.srow-1);j<rec_control.erow;j++){
        tmp=agile_data[j];
        html = "<tr>";
        header_arr.forEach(function(val,i){
          html += `<td align="${settings.halign[i]}">${(JSON.stringify(settings.dtformatcols).indexOf('"'+val+'"')>-1)?format_date(new Date(tmp[val]),settings.dtformatcols[val]):((JSON.stringify(settings.numformatcols).indexOf('"'+val+'"')>-1)?format_number(tmp[val],settings.numformatcols[val]):tmp[val])}</td>`;
        });//inner loop
        html += "</tr>";
        $('.json2agilereport tbody').append(html);
      };//outer loop
      rec_control.curr_pos=rec_control.erow;
    }//append_rows
    function filter_data_event(){
      $('.agile_top_tools input[type="search"]').bind("change paste keyup",function(){
        $('.agile_top_tools').addClass('loading');
        $('tr.agile_sort th').removeClass('asc').removeClass('desc');
      });
      // detect the change
      $('.agile_top_tools input[type="search"]').bind("change paste keyup",delay(function (e) {
          let fval=$(this).val().toUpperCase();
          html="";
          agile_data=[];
          if(fval.length>0){
            settings.data.forEach(function(val,i){
              header_arr.forEach(function(ival,j){
                tmp=val[ival];
                if( tmp.toString().toUpperCase().indexOf(fval)>-1 ){
                  agile_data.push(settings.data[i]);
                  if (html.indexOf(val[ival])==-1) {
                    html=html+`<li>${val[ival]}</li>`;
                  }
                }
              });//inner loop
            });//outer loop
            $('ul.agile_suggest').html(html);
            if($('.agile_top_tools input[type="search"]').is(":focus"))
            $('ul.agile_suggest').show();
            $('ul.agile_suggest li').click(function(){
              $('.agile_top_tools input').val($(this).text());
            })
          }else{
            agile_data=settings.data;
          }
          rec_control.srow=1;rec_control.erow=rec_control.psize;
          $('.json2agilereport tbody').html('');
          append_rows.call(this);
          set_pagination();
          if (settings.report_type=="pagination" && agile_data.length==0) {
            $('.agile_bottom_tools').hide();
          }else {
            $('.agile_bottom_tools').show();
          }
          if (agile_data.length==0){
              $('.json2agilereport tbody').append(`<tr><td align="center" colspan="${header_arr.length}" style="font-size: 11px;color: #d40e0e;font-weight: bold;">No Matching Record !</td></tr>`);
          }
          $('.agile_top_tools').removeClass('loading');
          settings.callback.call(this);
      },700));
      $(document).mouseup(function(){
          $('.agile_suggest').hide();
      });
    }//filter_data_event
    function delay(callback, ms) {
      var timer = 0;
      return function() {
        var context = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
          callback.apply(context, args);
        }, ms || 0);
      };
    }//delay
    function set_pagination(){
      let act_page=Math.ceil(rec_control.curr_pos/rec_control.psize),i;
      html = '<a href="javascript:void(0)" class="agile_prevset">&lt;&lt;</a><a href="javascript:void(0)" class="agile_prev">&lt;</a>';
      for(i=1;i<=Math.ceil(agile_data.length/rec_control.psize);i++){
          if(i==act_page)html += `<a href="javascript:void(0)" class="active">${i}</a>`;
          else if(i>3) html += `<a href="javascript:void(0)" class="agile_hide">${i}</a>`;
          else html += `<a href="javascript:void(0)">${i}</a>`;
      }
      html += '<a href="javascript:void(0)" class="agile_next">&gt;</a><a href="javascript:void(0)" class="agile_nextset">&gt;&gt;</a>';
      $('.pagination').html(html);
      if(i<=4)$('a.agile_prevset,a.agile_nextset').remove();
      if($('.agile_bottom_tools .pagination a').length==3)$('a.agile_prev,a.agile_next').remove();
      $('.pagination a').click(function(){
        if ( $(this).hasClass('agile_prev') || $(this).hasClass('agile_next') || $(this).hasClass('agile_nextset') || $(this).hasClass('agile_prevset') ) return;
        let pno = $(this).text();
        $('.agile_top_tools').addClass('loading');
        rec_control.srow=((pno-1)*rec_control.psize)+1;
        rec_control.erow=rec_control.srow+rec_control.psize-1;
        $('.json2agilereport tbody').html('');
        append_rows.call(this);
        $('.pagination a.active').removeClass('active');
        $(this).addClass('active');
        $('.agile_top_tools').removeClass('loading');
        settings.callback.call(this);
      });
      $('.pagination a.agile_prev').click(function(){
        let pno = Number($('.pagination a.active').text())-1;
        if($('.pagination a.active').hasClass('agile_hide')){
          pno=Number($('.pagination a:not([class*="agile_"])')[0].innerHTML);
        }
        if (pno==0)return;
        $('.agile_top_tools').addClass('loading');
        rec_control.srow=((pno-1)*rec_control.psize)+1;
        rec_control.erow=rec_control.srow+rec_control.psize-1;
        $('.json2agilereport tbody').html('');
        append_rows.call(this);
        if($('.pagination a.active').hasClass('agile_hide')){
          $('.pagination a.active:eq(0)').removeClass('active');
          $('.pagination a').each(function(){
            if($(this).text()==pno)$(this).addClass('active');
          });
        }else{
          $('.pagination a.active').prev().addClass('active');
          $('.pagination a.active:eq(1)').removeClass('active');
          $('.pagination a').each(function(){
              if($(this).text()==pno && $(this).hasClass('agile_hide')){
                  $(this).removeClass('agile_hide');
                  $(this).next().next().next().addClass('agile_hide');
              }
          });
        }
        $('.agile_top_tools').removeClass('loading');
        settings.callback.call(this);
      });
      $('.pagination a.agile_next').click(function(){
        let pno = Number($('.pagination a.active').text())+1;
        if($('.pagination a.active').hasClass('agile_hide')){
          pno=Number($('.pagination a:not([class*="agile_"])')[0].innerHTML);
        }
        if (pno>Math.ceil(agile_data.length/rec_control.psize))return;
        $('.agile_top_tools').addClass('loading');
        rec_control.srow=((pno-1)*rec_control.psize)+1;
        rec_control.erow=rec_control.srow+rec_control.psize-1;
        $('.json2agilereport tbody').html('');
        append_rows.call(this);
        if($('.pagination a.active').hasClass('agile_hide')){
          $('.pagination a.active:eq(0)').removeClass('active');
          $('.pagination a').each(function(){
            if($(this).text()==pno)$(this).addClass('active');
          });
        }else{
          $('.pagination a.active').next().addClass('active');
          $('.pagination a.active:eq(0)').removeClass('active');
          $('.pagination a').each(function(){
              if($(this).text()==pno && $(this).hasClass('agile_hide')){
                  $(this).removeClass('agile_hide');
                  $(this).prev().prev().prev().addClass('agile_hide');
              }
          });
        }
        $('.agile_top_tools').removeClass('loading');
        settings.callback.call(this);
      });
      $('.pagination a.agile_nextset').click(function(){
        let objarr=$('.pagination a:not([class*="agile_"])');
        let vpage = Number(objarr[objarr.length-1].innerHTML);
        if(!vpage || vpage==Math.ceil(agile_data.length/rec_control.psize))return;
        for(let i=1;i<=3;i++){
          $('.pagination a').each(function(){
              if($(this).text()==(vpage+i) && $(this).hasClass('agile_hide')){
                  $(this).removeClass('agile_hide');
                  $(objarr[i-1]).addClass('agile_hide');
              }
          });
        }
        settings.callback.call(this);
      });
      $('.pagination a.agile_prevset').click(function(){
        let objarr=$('.pagination a:not([class*="agile_"])');
        let vpage = Number(objarr[0].innerHTML);
        if(!vpage || vpage==1)return;
        for(let i=1;i<=3;i++){
          $('.pagination a').each(function(){
              if($(this).text()==(vpage-i) && $(this).hasClass('agile_hide')){
                  $(this).removeClass('agile_hide');
                  $(objarr[objarr.length-i]).addClass('agile_hide');
              }
          });
        }
        settings.callback.call(this);
      });
    }//set_pagination
    function enable_sort(){
      $('tr.agile_sort th').click(function(){
          $('.agile_top_tools').addClass('loading');
          let key_name=$(this).data('key');
          if($(this).hasClass('asc')){
              $('tr.agile_sort th').removeClass('asc').removeClass('desc');
              sort_by_key_desc(agile_data,key_name);
              $(this).addClass('desc');
          }else{
              $('tr.agile_sort th').removeClass('asc').removeClass('desc');
              sort_by_key(agile_data,key_name); 
              $(this).addClass('asc');   
          }
          $('.json2agilereport tbody').html('');
          if(settings.report_type=="lazy_load" || settings.report_type=="pagination"){
              rec_control.srow=1;rec_control.erow=rec_control.psize;
          }else{
              rec_control.srow=1;rec_control.erow=agile_data.length;
          }
          append_rows.call(this);
          set_pagination();
          $('.agile_top_tools').removeClass('loading');
          settings.callback.call(this);
          });//sorting         
    }//enable_sort
    function down_csv(){
      let hiddenElement = document.createElement('a');
      hiddenElement.href = 'data:text/csv;charset=utf-8,' + ConvertToCSV(agile_data);
      hiddenElement.target = '_blank';
      hiddenElement.download = settings.csv_file_name.replace('.csv','')+'_'+format_date(new Date())+'_'+new Date().getHours()+'_'+new Date().getMinutes()+'_'+new Date().getSeconds()+'.csv';
      hiddenElement.click();        
    }//down_csv
    function json2excel(){
      let list_data = {};
      list_data.options = { fileName: settings.excel_file_name.replace('.xlsx','')+'_'+format_date(new Date())+'_'+new Date().getHours()+'_'+new Date().getMinutes()+'_'+new Date().getSeconds() };
      list_data.tableData = [{ sheetName: settings.excel_file_name.replace('.xlsx',''), data: [] }];
      let data =[],t={},fmt={};
      header_arr.forEach(function(val){
        data.push({'style': {
                                "font": {
                                    "bold": true
                                },
                                "fill": {
                                    "patternType": "solid",
                                    "fgColor": { rgb: "cccccccc" }
                                },
                                  "alignment":{"horizontal":"center"}
                            },
                            text: val
                    });
        (JSON.stringify(settings.numformatcols).indexOf('"'+val+'"')>-1)?fmt[val]=get_excel_fmt_nm_cd(settings.numformatcols[val]):'';
      });//header_arr forEach

      list_data.tableData[0].data.push(data);

      agile_data.forEach(function(val){
          data=[];
          header_arr.forEach(function(index,j){
            t={'style': {"alignment":{"horizontal":settings.halign[j]}},"text":((JSON.stringify(settings.dtformatcols).indexOf('"'+index+'"')>-1)?format_date(new Date(val[index]),settings.dtformatcols[index]):val[index])};
            (JSON.stringify(settings.numformatcols).indexOf('"'+index+'"')>-1)?t.format=fmt[index]:'';
            data.push(t);
          });
          list_data.tableData[0].data.push(data);
      });//agile_data forEach       

        /*
        data = [{"merge":{"c":2,"r":2},'style': {"alignment":{"wrapText":true}},"text":"Disclaimer: These service leads are provided for your convenience using data sourced from your Dealer Management System.Your dealership is responsible to ensure that you "},{"text":""},{"text":""}]
        list_data.tableData[0].data.push(data);  
        *///merging

        if(settings.excel_parameter_tab){
          list_data.tableData.push({ sheetName: "Parameters", data: [] });
          let arr=settings.excel_parameter_string.replace('Filters:','').split(',');
          arr.forEach(function(val){
              data = [{
                  'style': {"font": { "bold": true }},
                  text: val.split('=')[0].trim()
              }];
              data.push({ text: val.split('=')[1].trim() }); 
              list_data.tableData[1].data.push(data);   
          });            
        }
        Jhxlsx.export(list_data.tableData, list_data.options);
    }//json2excel
    function destroy(){
      agile_data=[],tmp,settings,header_arr=[],html="",rec_control={"psize":0,"srow":"","erow":"","curr_pos":""},Jhxlsx="";
      $('.agile_wrapper,.agile_wrapper *,.agile_down .excel,.agile_down .csv').off();
      this.html("");
    };

    /**************Helper Functions******************/
    function Workbook() {
      if (!(this instanceof Workbook))
          return new Workbook();
      this.SheetNames = [];
      this.Sheets = {};
    }//Workbook    
    function create_jhxlsx_obj(){
      /*
      * ####################################################################################################
      * https://www.npmjs.com/package/xlsx-style
      * ####################################################################################################
      */
     if(typeof(XLSX)=="undefined" && typeof(require)!="undefined")
     var XLSX = require('xlsx');   
      Jhxlsx = {
        config: {
            fileName: "report",
            extension: ".xlsx",
            sheetName: "Sheet",
            fileFullName: "report.xlsx",
            header: true,
            createEmptyRow: true,
            maxCellWidth: 20
        },
        worksheetObj: {},
        rowCount: 0,
        wsColswidth: [],
        merges: [],
        worksheet: {},
        range: {},
        init: function (options) {
            this.reset();
            if (options) {
                for (var key in this.config) {
                    if (options.hasOwnProperty(key)) {
                        this.config[key] = options[key];
                    }
                }
            }
            this.config['fileFullName'] = this.config.fileName + this.config.extension;
        },
        reset: function () {
            this.range = {s: {c: 10000000, r: 10000000}, e: {c: 0, r: 0}};
            this.worksheetObj = {};
            this.rowCount = 0;
            this.wsColswidth = [];
            this.merges = [];
            this.worksheet = {};
        },
        parse2Int0: function (num) {
            num = parseInt(num);
            //num = Number.isNaN(num) ? 0 : num;
            return num;
        },
        cellWidth: function (cellText, pos) {
            var max = (cellText && cellText.length * 1.3);
            if (this.wsColswidth[pos]) {
                if (max > this.wsColswidth[pos].wch) {
                    this.wsColswidth[pos] = {wch: max};
                }
            } else {
                this.wsColswidth[pos] = {wch: max};
            }
        },
        cellWidthValidate: function () {
            for (var i in this.wsColswidth) {
                if (this.wsColswidth[i].wch > this.config.maxCellWidth) {
                    this.wsColswidth[i].wch = this.config.maxCellWidth;
                }else if( !this.wsColswidth[i].wch || this.wsColswidth[i].wch<10 ){
                    this.wsColswidth[i].wch = 10;
                }
            }
        },
        datenum: function (v, date1904) {
            if (date1904)
                v += 1462;
            var epoch = Date.parse(v);
            return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
        },
        setCellDataType: function (cell) {
            if (typeof cell.v === 'number') {
                cell.t = 'n';
            } else if (typeof cell.v === 'boolean') {
                cell.t = 'b';
            } else if (cell.v instanceof Date) {
                cell.t = 'n';
                cell.z = XLSX.SSF._table[14];
                cell.v = this.datenum(cell.v);
            } else {
                cell.t = 's';
            }
        },
        jhAddRow: function (rowObj) {
            for (var c in rowObj) {
                c = this.parse2Int0(c);
                var cellObj = rowObj[c];
                if (this.range.s.r > this.rowCount)
                    this.range.s.r = this.rowCount;
                if (this.range.s.c > c)
                    this.range.s.c = c;
                if (this.range.e.r < this.rowCount)
                    this.range.e.r = this.rowCount;
                if (this.range.e.c < c)
                    this.range.e.c = c;

                var cellText = null;
                if (cellObj.hasOwnProperty('text')) {
                    cellText = cellObj.text;
                }
                var cell = {v: cellText};
                if (cellObj.hasOwnProperty('format')) {
                    cell.z = cellObj.format;
                }//rati            

                var calColWidth = true;
                if (cellObj.hasOwnProperty('merge')) {
                    var mergeObj = cellObj.merge;
                    calColWidth = false;
                    //var colStartEnd = cellObj.merge.split('-');
                    var ec = c;
                    var er = this.rowCount;
                    if (mergeObj.hasOwnProperty('c')) {
                        ec = (c + parseInt(mergeObj.c));
                    }
                    if (mergeObj.hasOwnProperty('r')) {
                        er = (this.rowCount + parseInt(mergeObj.r));
                    }

                    this.merges.push({s: {r: this.rowCount, c: c}, e: {r: er, c: ec}});
                    //this.merges.push({s: {r: this.rowCount, c: c}, e: {r: (this.rowCount + 1), c: (c + 2)}});
                }
                if (calColWidth) {
                    this.cellWidth(cell.v, c);
                }
                if (cell.v === null)
                    continue;
                var cell_ref = XLSX.utils.encode_cell({c: c, r: this.rowCount});
                this.setCellDataType(cell);
                if (cellObj.hasOwnProperty('style')) {
                    cell.s = cellObj.style;
                }
                this.worksheet[cell_ref] = cell;
            }
            this.rowCount++;
        },
        createWorkSheet: function () {
            for (var i in this.worksheetObj.data) {
                this.jhAddRow(this.worksheetObj.data[i]);
            }
            this.cellWidthValidate();
            //console.log(this.merges);
            //this.worksheet['!merges'] = [{s: {r: 0, c: 0}, e: {r: 0, c: 4}},{s: {r: 5, c: 0}, e: {r: 6, c: 3}}];//this.merges;
            this.worksheet['!merges'] = this.merges;
            this.worksheet['!cols'] = this.wsColswidth;
            if (this.range.s.c < 10000000)
                this.worksheet['!ref'] = XLSX.utils.encode_range(this.range);
            return this.worksheet;
        },
        s2ab: function (s) {
            var buf = new ArrayBuffer(s.length);
            var view = new Uint8Array(buf);
            for (var i = 0; i != s.length; ++i)
                view[i] = s.charCodeAt(i) & 0xFF;
            return buf;
        },
        getBlob: function (workbookObj, options) {
            this.init(options);
            var workbook = new Workbook();
            /* add worksheet to workbook */
            for (var i in workbookObj) {
                this.reset();
                this.worksheetObj = workbookObj[i];
                var sheetName = this.config.sheetName + i;
                if (this.worksheetObj.hasOwnProperty('sheetName')) {
                    sheetName = this.worksheetObj.sheetName;
                }
                this.createWorkSheet();
                workbook.SheetNames.push(sheetName);
                workbook.Sheets[sheetName] = this.worksheet;
            }
            var wbout = XLSX.write(workbook, {bookType: 'xlsx', bookSST: true, type: 'binary'});
            var blobData = new Blob([this.s2ab(wbout)], {type: "application/octet-stream"});
            return blobData;
        },
        export: function (workbookObj, options) {
            //rati if(typeof(saveAs)=="undefined" && typeof(require)!="undefined")
            //rati var saveAs = require('saveAs');  
            saveAs(this.getBlob(workbookObj, options), this.config.fileFullName);
        },
      }
    }//create_jhxlsx_obj
    function ConvertToCSV(objArray) {
          let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
          let str = '';
          let line = '';

          for (var index in header_arr) {
                  if (line != '') line += ','
                  line += header_arr[index];
              }            
          str += line + '\r\n';
          for (var i = 0; i < array.length; i++) {
              line = '';
              for (var index in array[i]) {
                  let data=array[i][index];
                  if (line != '') line += ','
                  data = (JSON.stringify(settings.dtformatcols).indexOf('"'+index+'"')>-1)?format_date(new Date(data),settings.dtformatcols[index]):((JSON.stringify(settings.numformatcols).indexOf('"'+index+'"')>-1)?format_number(data,settings.numformatcols[index]):data);
                  if(data.toString().indexOf(',')>-1)data='"'+data+'"';
                  line += data;
              }

              str += line + '\r\n';
          }

          return str;
    }//ConvertToCSV  
    function format_number(val,format){
      if(val){
        if(format.decimals)val=val.toFixed(format.decimals).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        if(format.number_prefix && Number(val.replace(/\,/g,''))<0 )val='<span class="negative">('+format.number_prefix+val.replace(/\-/,'')+')</span>';
        else if(format.number_prefix)val=format.number_prefix+val;
        else if(format.number_suffix  && Number(val.replace(/\,/g,''))<0 )val='<span class="negative">('+val.replace(/\-/,'')+format.number_suffix+')</span>';
        else if(format.number_suffix)val=val+format.number_suffix;
      }
      return val;
    }//format_number
    function get_excel_fmt_nm_cd(format){
        let fmt="###,###,###,###,##0.",i;
        if(format.decimals)for(i=0;i<format.decimals;i++)fmt+='0';
        fmt=fmt.replace(/\.$/,'');
        if(format.number_prefix)fmt=format.number_prefix+fmt;
        if(format.number_suffix)fmt=fmt+format.number_suffix;
      return fmt;
    }//format_number      
    function format_date(dt,format){
      if(format=='dd-mm-yyyy')return dt.getDate() + "-" + (dt.getMonth() + 1) + "-" + dt.getFullYear();
      else if(format=='dd/mm/yyyy')return dt.getDate() + "-" + (dt.getMonth() + 1) + "-" + dt.getFullYear();
      else if(format=='mm-dd-yyyy')return (dt.getMonth() + 1) + "-" + dt.getDate() + "-" + dt.getFullYear();
      else if(format=='mm/dd/yyyy')return (dt.getMonth() + 1) + "/" + dt.getDate() + "/" + dt.getFullYear();
      else if(format=='dd/mon/yyyy')return dt.getDate() + "/" + mth[dt.getMonth()] + "/" + dt.getFullYear();    
      else if(format=='dd-mon-yyyy')return dt.getDate() + "-" + mth[dt.getMonth()] + "-" + dt.getFullYear();    
      else if(format=='dd mon yyyy')return dt.getDate() + " " + mth[dt.getMonth()] + " " + dt.getFullYear();    
      else if(format=='dd month yyyy')return dt.getDate() + " " + fmth[dt.getMonth()] + " " + dt.getFullYear();    
      else if(format=='month dd,yyyy')return fmth[dt.getMonth()] + " " + dt.getDate() + "," + dt.getFullYear();      
      else return mth[dt.getMonth()] + "_" + dt.getDate() + "_" + dt.getFullYear();      
    }//format_date      
    function sort_by_key(array, key){
      return array.sort(function(a, b){
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
      });
    }//sort_by_key
    function sort_by_key_desc(array, key){
      return array.sort(function(a, b){
        var x = a[key]; var y = b[key];
        return ((x > y) ? -1 : ((x < y) ? 1 : 0));
      });
    }//sort_by_key      
    /**************Helper Functions******************/
  }( jQuery ));
export default $.fn.agilereport;