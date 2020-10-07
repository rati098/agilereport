"use strict";function _typeof(t){return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}!function(s,t,l,a){var i="agilereport";function e(t,a){if(this.element=t,this.$element=s(t),this.SortMonth=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],this.FullMonth=["January","February","March","April","May","June","July","August","September","Octomber","November","December"],this.options=s.extend({div_class:"",halign:"",no_of_rows:15,dtformatcols:{},csv_download:!0,csv_file_name:"data.csv",excel_download:!0,excel_file_name:"data.xlsx",excel_parameter_tab:!1,excel_parameter_string:"",numformatcols:{},sorting:!0,report_type:"lazy_load",callback:function(t){}},a),this._defaults=this.options,this._name=i,this.header_arr=[],this.html="",this.temp="",this.controls={paginationSize:0,srow:"",erow:"",current_position:""},this.Jhxlsx="","destroy"!=a)if(this.p_halign=[],a.data&&0!=a.data.length){for(var e in a.data[0])this.header_arr.push(e),this.p_halign.push("left");this._defaults.halign=this.p_halign,this.agile_data=this._defaults.data,this.controls.paginationSize=Number(this._defaults.no_of_rows),this.GenerateHeader(this._defaults,this.$element),this.GenerateBody(this._defaults,this.$element),this.FilterReport(this._defaults,this.$element),this._defaults.callback(this)}else this.html("No Data Found !").addClass("agile_no_data");else this.destroy(this._defaults,this.$element)}e.prototype.GenerateHeader=function(e,i){var t=this;i.html('<div id="'.concat(i.attr("id")+"_wrapper",'" class="agile_wrapper">\n                <div id="').concat(i.attr("id")+"_container",'" class="agile_top_tools">\n                <input id="').concat(i.attr("id")+"_input",'" type="search" placeholder="Search" />\n                <ul class="agile_suggest"></ul><div class="agile_down">\n                <ul>').concat(e.csv_download?'<li class="csv">Download CSV</li>':"").concat(e.excel_download?'<li class="excel">Download Excel</li>':"",'</ul></div></div>\n                <div id="').concat(i.attr("id")+"_report",'" class="json2agilereport ').concat(e.div_class,'">\n                <table class="report_table">\n                  <thead>\n                    <tr class=').concat(e.sorting?'"agile_sort"':'""',"></tr>\n                  </thead>\n                  <tbody>\n                  </tbody>\n                </table>\n                </div>\n                </div>\n                ")),s("#"+i.attr("id")+"_wrapper,#"+i.attr("id")+"_report .report_table,#"+i.attr("id")+"_report").css({width:"100%",margin:"0 auto"}),s("#"+i.attr("id")+"_report").scroll(function(){s("#"+i.attr("id")+"_report .agile_sort th").css({position:"relative",top:s(this).scrollTop(),background:"#fff"})}),e.csv_download||e.excel_download||s("#"+i.attr("id")+"_wrapper .agile_down").remove(),s("#"+i.attr("id")+"_wrapper .agile_down .csv").click(function(){t.downloadCSV(e)}),s("#"+i.attr("id")+"_wrapper .agile_down .excel").click(function(){}),e.table_header&&s("#"+i.attr("id")+"_wrapper").prepend('<div class="theader">'.concat(e.table_header,"</div>")),t.header_arr.forEach(function(t,a){s("#"+i.attr("id")+"_report thead tr").append('<th align="'.concat(e.halign[a],'" data-key="').concat(t,'">').concat(t,"</th>"))}),e.sorting&&t.EnableSorting(e,i)},e.prototype.GenerateBody=function(i,o){var n=this;"lazy_load"==i.report_type||"pagination"==i.report_type?(this.controls.srow=1,this.controls.erow=this.controls.paginationSize):(this.controls.srow=1,this.controls.erow=this.agile_data.length),this.AppendRows(i,o),"pagination"==i.report_type?(s("#"+o.attr("id")+"_wrapper").append('<div class="agile_bottom_tools">\n      <input type="text" id="'.concat(o.attr("id")+"_limit",'" value="').concat(this.controls.paginationSize,'"><span> rows per page</span>\n      <div class="pagination" id="').concat(o.attr("id")+"_pagination",'"></div></div>')),this.SetPagination(i,o),s("#"+o.attr("id")+"_limit").change(function(){n.controls.paginationSize=Number(s(this).val()),n.agile_data=i.data,n.controls.srow=1,n.controls.erow=n.controls.paginationSize,s("#"+o.attr("id")+"_report tbody").html(""),n.AppendRows(i,o),n.SetPagination(i,o),i.callback(n)})):"lazy_load"==i.report_type&&s("#"+o.attr("id")+"_report").scrollTop(0).scroll(function(t){var a=s(this),e=a.children("table");a.scrollTop()>=e.height()-a.height()&&(this.controls.srow=this.controls.current_position+1,this.controls.erow=this.controls.current_position+this.controls.paginationSize,this.AppendRows(i,o),i.callback(n))})},e.prototype.AppendRows=function(e,t){var i=this;if(!(this.agile_data.length<this.controls.srow)){this.controls.erow=this.agile_data.length<this.controls.erow?this.agile_data.length:this.controls.erow;for(var a=this.controls.srow-1;a<this.controls.erow;a++)this.temp=this.agile_data[a],this.html="<tr>",this.header_arr.forEach(function(t,a){i.html+='<td align="'.concat(e.halign[a],'">\n        ').concat(-1<JSON.stringify(e.dtformatcols).indexOf('"'+t+'"')?i.FormatDate(new Date(i.temp[t]),e.dtformatcols[t]):-1<JSON.stringify(e.numformatcols).indexOf('"'+t+'"')?i.FormatNumber(i.temp[t],e.numformatcols[t]):i.temp[t],"</td>")}),this.html+="</tr>",s("#"+t.attr("id")+"_report tbody").append(this.html);this.controls.current_position=this.controls.erow}},e.prototype.FormatNumber=function(t,a){return t&&(a.decimals&&(t=t.toFixed(a.decimals).toString().replace(/\B(?=(\d{3})+(?!\d))/g,",")),a.number_prefix&&Number(t.replace(/\,/g,""))<0?t='<span class="negative">('+a.number_prefix+t.replace(/\-/,"")+")</span>":a.number_prefix?t=a.number_prefix+t:a.number_suffix&&Number(t.replace(/\,/g,""))<0?t='<span class="negative">('+t.replace(/\-/,"")+a.number_suffix+")</span>":a.number_suffix&&(t+=a.number_suffix)),t},e.prototype.FormatDate=function(t,a){return"dd-mm-yyyy"==a?t.getDate()+"-"+(t.getMonth()+1)+"-"+t.getFullYear():"dd/mm/yyyy"==a?t.getDate()+"-"+(t.getMonth()+1)+"-"+t.getFullYear():"mm-dd-yyyy"==a?t.getMonth()+1+"-"+t.getDate()+"-"+t.getFullYear():"mm/dd/yyyy"==a?t.getMonth()+1+"/"+t.getDate()+"/"+t.getFullYear():"dd/mon/yyyy"==a?t.getDate()+"/"+this.SortMonth[t.getMonth()]+"/"+t.getFullYear():"dd-mon-yyyy"==a?t.getDate()+"-"+this.SortMonth[t.getMonth()]+"-"+t.getFullYear():"dd mon yyyy"==a?t.getDate()+" "+this.SortMonth[t.getMonth()]+" "+t.getFullYear():"dd month yyyy"==a?t.getDate()+" "+this.FullMonth[t.getMonth()]+" "+t.getFullYear():"month dd,yyyy"==a?this.FullMonth[t.getMonth()]+" "+t.getDate()+","+t.getFullYear():this.SortMonth[t.getMonth()]+"_"+t.getDate()+"_"+t.getFullYear()},e.prototype.EnableSorting=function(a,e){var i=this;s("#"+e.attr("id")+"_report th").click(function(){s("#"+e.attr("id")+"_container").addClass("loading");var t=s(this).data("key");s(this).hasClass("asc")?(s("#"+e.attr("id")+"_report th").removeClass("asc").removeClass("desc"),i.SortByKeyDesc(a.data,t),s(this).addClass("desc")):(s("#"+e.attr("id")+"_report th").removeClass("asc").removeClass("desc"),i.SortByKey(a.data,t),s(this).addClass("asc")),s("#"+e.attr("id")+"_report tbody").html(""),"lazy_load"==a.report_type||"pagination"==a.report_type?(i.controls.srow=1,i.controls.erow=i.controls.paginationSize):(i.controls.srow=1,i.controls.erow=a.data.length),i.AppendRows(a,e),i.SetPagination(a,e),s("#"+e.attr("id")+"_container").removeClass("loading"),a.callback.call(this)})},e.prototype.SortByKey=function(t,o){return t.sort(function(t,a){var e=t[o],i=a[o];return e<i?-1:i<e?1:0})},e.prototype.SortByKeyDesc=function(t,o){return t.sort(function(t,a){var e=t[o],i=a[o];return i<e?-1:e<i?1:0})},e.prototype.SetPagination=function(o,n){var t,r=this,a=Math.ceil(r.controls.current_position/r.controls.paginationSize);for(r.html='<a href="javascript:void(0)" class="agile_prevset">&lt;&lt;</a><a href="javascript:void(0)" class="agile_prev">&lt;</a>',t=1;t<=Math.ceil(r.agile_data.length/r.controls.paginationSize);t++)r.html+=t==a?'<a href="javascript:void(0)" class="active">'.concat(t,"</a>"):3<t?'<a href="javascript:void(0)" class="agile_hide">'.concat(t,"</a>"):'<a href="javascript:void(0)">'.concat(t,"</a>");r.html+='<a href="javascript:void(0)" class="agile_next">&gt;</a><a href="javascript:void(0)" class="agile_nextset">&gt;&gt;</a>',s("#"+n.attr("id")+"_pagination").html(r.html),t<=4&&s("#"+n.attr("id")+"_pagination a.agile_prevset,#"+n.attr("id")+"_pagination a.agile_nextset").remove(),3==s("#"+n.attr("id")+"_pagination a").length&&s("#"+n.attr("id")+"_pagination a.agile_prev, #"+n.attr("id")+"_pagination a.agile_next").remove(),s("#"+n.attr("id")+"_pagination a").click(function(){if(!(s(this).hasClass("agile_prev")||s(this).hasClass("agile_next")||s(this).hasClass("agile_nextset")||s(this).hasClass("agile_prevset"))){var t=s(this).text();s("#"+n.attr("id")+"_container").addClass("loading"),r.controls.srow=(t-1)*r.controls.paginationSize+1,r.controls.erow=r.controls.srow+r.controls.paginationSize-1,s("#"+n.attr("id")+"_report tbody").html(""),r.AppendRows(o,n),s("#"+n.attr("id")+"_pagination a.active").removeClass("active"),s(this).addClass("active"),s("#"+n.attr("id")+"_container").removeClass("loading"),o.callback(r)}}),s("#"+n.attr("id")+"_pagination a.agile_prev").click(function(){var t=Number(s("#"+n.attr("id")+"_pagination a.active").text())-1;s("#"+n.attr("id")+"_pagination a.active").hasClass("agile_hide")&&(t=Number(s("#"+n.attr("id")+'_pagination a:not([class*="agile_"])')[0].innerHTML)),0!=t&&(s("#"+n.attr("id")+"_container").addClass("loading"),r.controls.srow=(t-1)*r.controls.paginationSize+1,r.controls.erow=r.controls.srow+r.controls.paginationSize-1,s("#"+n.attr("id")+"_report tbody").html(""),r.AppendRows(o,n),s("#"+n.attr("id")+"_pagination a.active").hasClass("agile_hide")?(s("#"+n.attr("id")+"_pagination a.active:eq(0)").removeClass("active"),s("#"+n.attr("id")+"_pagination a").each(function(){s(this).text()==t&&s(this).addClass("active")})):(s("#"+n.attr("id")+"_pagination a.active").prev().addClass("active"),s("#"+n.attr("id")+"_pagination a.active:eq(1)").removeClass("active"),s("#"+n.attr("id")+"_pagination a").each(function(){s(this).text()==t&&s(this).hasClass("agile_hide")&&(s(this).removeClass("agile_hide"),s(this).next().next().next().addClass("agile_hide"))})),s("#"+n.attr("id")+"_container").removeClass("loading"),o.callback(r))}),s("#"+n.attr("id")+"_pagination a.agile_next").click(function(){var t=Number(s("#"+n.attr("id")+"_pagination a.active").text())+1;s("#"+n.attr("id")+"_pagination a.active").hasClass("agile_hide")&&(t=Number(s("#"+n.attr("id")+'_pagination a:not([class*="agile_"])')[0].innerHTML)),t>Math.ceil(r.agile_data.length/r.controls.paginationSize)||(s("#"+n.attr("id")+"_container").addClass("loading"),r.controls.srow=(t-1)*r.controls.paginationSize+1,r.controls.erow=r.controls.srow+r.controls.paginationSize-1,s("#"+n.attr("id")+"_report tbody").html(""),r.AppendRows(o,n),s("#"+n.attr("id")+"_pagination a.active").hasClass("agile_hide")?(s("#"+n.attr("id")+"_pagination a.active:eq(0)").removeClass("active"),s("#"+n.attr("id")+"_pagination a").each(function(){s(this).text()==t&&s(this).addClass("active")})):(s("#"+n.attr("id")+"_pagination a.active").next().addClass("active"),s("#"+n.attr("id")+"_pagination a.active:eq(0)").removeClass("active"),s("#"+n.attr("id")+"_pagination a").each(function(){s(this).text()==t&&s(this).hasClass("agile_hide")&&(s(this).removeClass("agile_hide"),s(this).prev().prev().prev().addClass("agile_hide"))})),s("#"+n.attr("id")+"_container").removeClass("loading"),o.callback(r))}),s("#"+n.attr("id")+"_pagination a.agile_nextset").click(function(){var a=s("#"+n.attr("id")+'_pagination a:not([class*="agile_"])'),e=Number(a[a.length-1].innerHTML);if(e&&e!=Math.ceil(r.agile_data.length/r.controls.paginationSize)){for(var t=function(t){s("#"+n.attr("id")+"_pagination a").each(function(){s(this).text()==e+t&&s(this).hasClass("agile_hide")&&(s(this).removeClass("agile_hide"),s(a[t-1]).addClass("agile_hide"))})},i=1;i<=3;i++)t(i);o.callback(r)}}),s("#"+n.attr("id")+"_pagination a.agile_prevset").click(function(){var a=s("#"+n.attr("id")+'_pagination a:not([class*="agile_"])'),e=Number(a[0].innerHTML);if(e&&1!=e){for(var t=function(t){s("#"+n.attr("id")+"_pagination a").each(function(){s(this).text()==e-t&&s(this).hasClass("agile_hide")&&(s(this).removeClass("agile_hide"),s(a[a.length-t]).addClass("agile_hide"))})},i=1;i<=3;i++)t(i);o.callback(r)}})},e.prototype.FilterReport=function(n,a){var e,i,o,r=this;s("#"+a.attr("id")+"_input").bind("change paste keyup",function(){s("#"+a.attr("id")+"_container").addClass("loading"),s("#"+a.attr("id")+"_report thead th").removeClass("asc").removeClass("desc")}),s("#"+a.attr("id")+"_input").bind("change paste keyup",(e=function(t){var o=s(this).val().toUpperCase();r.html="",r.agile_data=[],0<o.length?(n.data.forEach(function(e,i){r.header_arr.forEach(function(t,a){r.temp=e[t],-1<r.temp.toString().toUpperCase().indexOf(o)&&(r.agile_data.push(n.data[i]),-1==r.html.indexOf(e[t])&&(r.html=r.html+"<li>".concat(e[t],"</li>")))})}),s("#"+a.attr("id")+"_container ul.agile_suggest").html(r.html),s("#"+a.attr("id")+"_input").is(":focus")&&s("#"+a.attr("id")+"_container ul.agile_suggest").show(),s("#"+a.attr("id")+"_container ul.agile_suggest li").click(function(){s("#"+a.attr("id")+"_input").val(s(this).text())})):r.agile_data=n.data,r.controls.srow=1,r.controls.erow=r.controls.paginationSize,s("#"+a.attr("id")+"_report tbody").html(""),r.AppendRows(n,a),r.SetPagination(n,a),"pagination"==n.report_type&&0==r.agile_data.length?s("#"+a.attr("id")+"_wrapper .agile_bottom_tools").hide():s("#"+a.attr("id")+"_wrapper .agile_bottom_tools").show(),0==r.agile_data.length&&s("#"+a.attr("id")+"_report tbody").append('<tr><td align="center" colspan="'.concat(r.header_arr.length,'" style="font-size: 11px;color: #d40e0e;font-weight: bold;">No Matching Record !</td></tr>')),s("#"+a.attr("id")+"_container").removeClass("loading"),n.callback(r)},i=700,o=0,function(){var t=this,a=arguments;clearTimeout(o),o=setTimeout(function(){e.apply(t,a)},i||0)})),s(l).mouseup(function(){s("#"+a.attr("id")+"_container ul.agile_suggest").hide()})},e.prototype.destroy=function(t,a){this.header_arr=[],this.html="",this.temp="",this.controls={paginationSize:0,srow:"",erow:"",current_position:""},this.agile_data=[],a.html("")},e.prototype.downloadCSV=function(t){var a=l.createElement("a");a.href="data:text/csv;charset=utf-8,"+this.ConvertToCSV(this.agile_data,t),a.target="_blank",a.download=t.csv_file_name.replace(".csv","")+"_"+this.FormatDate(new Date)+"_"+(new Date).getHours()+"_"+(new Date).getMinutes()+"_"+(new Date).getSeconds()+".csv",a.click()},e.prototype.ConvertToCSV=function(t,a){var e="object"!=_typeof(t)?JSON.parse(t):t,i="",o="";for(var n in this.header_arr)""!=o&&(o+=","),o+=this.header_arr[n];i+=o+"\r\n";for(var r=0;r<e.length;r++){for(var s in o="",e[r]){var l=e[r][s];""!=o&&(o+=","),-1<(l=-1<JSON.stringify(a.dtformatcols).indexOf('"'+s+'"')?this.FormatDate(new Date(l),a.dtformatcols[s]):-1<JSON.stringify(a.numformatcols).indexOf('"'+s+'"')?this.FormatNumber(l,a.numformatcols[s]):l).toString().indexOf(",")&&(l='"'+l+'"'),o+=l}i+=o+"\r\n"}return i},s.fn[i]=function(t){return this.each(function(){s.data(this,"plugin_"+i)||s.data(this,"plugin_"+i,new e(this,t))})}}(jQuery,window,document);