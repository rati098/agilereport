(function ($, window, document, undefined) {
  // Create the defaults once
  var pluginName = 'agilereport';

  // The actual plugin constructor
  function Plugin(element, options) {
    this.element = element;
    this.$element = $(element);
    this.SortMonth = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    this.FullMonth = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "Octomber", "November", "December"];
    this.options = $.extend({
      // These are the defaults.
      div_class: "",
      halign: "",
      no_of_rows: 15,
      dtformatcols: {},
      csv_download: true,
      csv_file_name: "data.csv",
      excel_download: true,
      excel_file_name: "data.xlsx",
      excel_parameter_tab: false,
      excel_parameter_string: "",
      numformatcols: {},
      sorting: true,
      report_type: "lazy_load",
      callback: function (data) {
        //console.log('callback not defined:' + this.innerHTML);
        //console.log(this.agile_data)
        //return data;
      }
    }, options);
    this._defaults = this.options;
    this._name = pluginName;
    this.header_arr = [];
    this.html = '';
    this.temp = '';
    this.controls = {
      paginationSize: 0,
      srow: "",
      erow: "",
      current_position: ""
    }
    if (options == 'destroy') {
      destroy.call(this);
      return;
    }
    this.p_halign = [];
    if (!options.data || options.data.length == 0) {
      this.html("No Data Found !").addClass('agile_no_data');
      return;
    }
    for (let i in options.data[0]) {
      this.header_arr.push(i);
      this.p_halign.push('left');
    }
    this._defaults.halign = this.p_halign;
    this.agile_data = this._defaults.data;
    this.controls.paginationSize = Number(this._defaults.no_of_rows);
    this.GenerateHeader(this._defaults, this.$element);
    this.GenerateBody(this._defaults, this.$element);
    this.FilterReport(this._defaults, this.$element);
    this._defaults.callback(this);
  }

  Plugin.prototype.GenerateHeader = function (settings, element) {
    // Place Header related logic here
    element.html(`<div id="${element.attr('id') + '_wrapper'}" class="agile_wrapper">
                <div id="${element.attr('id') + '_container'}" class="agile_top_tools">
                <input id="${element.attr('id') + '_input'}" type="search" placeholder="Search" />
                <ul class="agile_suggest"></ul><div class="agile_down">
                <ul>${settings.csv_download ? '<li class="csv">Download CSV</li>' : ''}${settings.excel_download ? '<li class="excel">Download Excel</li>' : ''}</ul></div></div>
                <div id="${element.attr('id') + '_report'}" class="json2agilereport ${settings.div_class}">
                <table class="report_table">
                  <thead>
                    <tr class=${settings.sorting ? '"agile_sort"' : '""'}></tr>
                  </thead>
                  <tbody>
                  </tbody>
                </table>
                </div>
                </div>
                `);
    $('#' + element.attr('id') + '_wrapper,#' + element.attr('id') + '_report .report_table,#' + element.attr('id') + '_report').css({
      "width": '100%',
      "margin": "0 auto"
    });
    $('#' + element.attr('id') + '_report').scroll(function () {
      $('#' + element.attr('id') + '_report .agile_sort th').css({
        'position': 'relative',
        'top': $(this).scrollTop(),
        'background': '#fff'
      })
    })
    if (!settings.csv_download && !settings.excel_download)
      $('.agile_down').remove();
    $('.agile_down .csv').click(function () {
      //down_csv();
    });
    $('.agile_down .excel').click(function () {
      //json2excel();
    });
    if (settings.table_header)
      $('#' + element.attr('id') + '_wrapper').prepend(`<div class="theader">${settings.table_header}</div>`);
    this.header_arr.forEach(function (a, i) {
      $('#' + element.attr('id') + '_report thead tr').append(`<th align="${settings.halign[i]}" data-key="${a}">${a}</th>`)
    });
    if (settings.sorting)
      this.EnableSorting(settings, element);
  }//Generate Header END;
  Plugin.prototype.GenerateBody = function (settings, element) {
    let _ = this;
    // Place Body related logic here
    if (settings.report_type == "lazy_load" || settings.report_type == "pagination") {
      this.controls.srow = 1;
      this.controls.erow = this.controls.paginationSize;
    } else {
      this.controls.srow = 1;
      this.controls.erow = this.agile_data.length;
    }
    this.AppendRows(settings, element)
    if (settings.report_type == "pagination") {
      $('#' + element.attr('id') + '_wrapper').append(`<div class="agile_bottom_tools">
      <input type="text" id="${element.attr('id') + '_limit'}" value="${this.controls.paginationSize}"><span> rows per page</span>
      <div class="pagination" id="${element.attr('id') + '_pagination'}"></div></div>`);
      this.SetPagination(settings, element)
      $('#' + element.attr('id') + '_limit').change(function () {
        _.controls.paginationSize = Number($(this).val());
        _.agile_data = settings.data;
        _.controls.srow = 1;
        _.controls.erow = _.controls.paginationSize
        $('#' + element.attr('id') + '_report tbody').html('');
        _.AppendRows(settings, element)
        _.SetPagination(settings, element)
        settings.callback(_);
      });
    } else if (settings.report_type == "lazy_load") {
      $('#' + element.attr('id') + '_report').scrollTop(0).scroll(function (event) {
        var self = $(this);
        var lTbl = self.children("table");
        if (self.scrollTop() >= lTbl.height() - self.height()) {
          this.controls.srow = this.controls.current_position + 1;
          this.controls.erow = this.controls.current_position + this.controls.paginationSize;
          this.AppendRows(settings, element)
          settings.callback(_);
        }
      });
    }//lazy_load
  };//Generate body END;
  Plugin.prototype.AppendRows = function (settings, element) {
    // Place append rows related logic here
    let _ = this;
    if (this.agile_data.length < this.controls.srow)
      return;
    this.controls.erow = (this.agile_data.length < this.controls.erow) ? this.agile_data.length : this.controls.erow;
    //prepare tbody  
    for (let j = (this.controls.srow - 1); j < this.controls.erow; j++) {
      this.temp = this.agile_data[j];
      this.html = "<tr>";
      this.header_arr.forEach(function (val, i) {
        _.html += `<td align="${settings.halign[i]}">
        ${(JSON.stringify(settings.dtformatcols).indexOf('"' + val + '"') > -1) ? _.FormatDate(new Date(_.temp[val]), settings.dtformatcols[val]) : ((JSON.stringify(settings.numformatcols).indexOf('"' + val + '"') > -1) ? _.FormatNumber(_.temp[val], settings.numformatcols[val]) : _.temp[val])}</td>`;
      });//inner loop
      this.html += "</tr>";
      $('#' + element.attr('id') + '_report tbody').append(this.html);
    };//outer loop
    this.controls.current_position = this.controls.erow;

  };//Append Rows END;
  Plugin.prototype.FormatNumber = function (value, format) {
    if (value) {
      if (format.decimals)
        value = value.toFixed(format.decimals).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      if (format.number_prefix && Number(value.replace(/\,/g, '')) < 0)
        value = '<span class="negative">(' + format.number_prefix + value.replace(/\-/, '') + ')</span>';
      else if (format.number_prefix)
        value = format.number_prefix + value;
      else if (format.number_suffix && Number(value.replace(/\,/g, '')) < 0)
        value = '<span class="negative">(' + value.replace(/\-/, '') + format.number_suffix + ')</span>';
      else if (format.number_suffix)
        value = value + format.number_suffix;
    }
    return value;
  }//Format Number END;
  Plugin.prototype.FormatDate = function (date, format) {
    if (format == 'dd-mm-yyyy')
      return date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
    else if (format == 'dd/mm/yyyy')
      return date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
    else if (format == 'mm-dd-yyyy')
      return (date.getMonth() + 1) + "-" + date.getDate() + "-" + date.getFullYear();
    else if (format == 'mm/dd/yyyy')
      return (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
    else if (format == 'dd/mon/yyyy')
      return date.getDate() + "/" + this.SortMonth[date.getMonth()] + "/" + date.getFullYear();
    else if (format == 'dd-mon-yyyy')
      return date.getDate() + "-" + this.SortMonth[date.getMonth()] + "-" + date.getFullYear();
    else if (format == 'dd mon yyyy')
      return date.getDate() + " " + this.SortMonth[date.getMonth()] + " " + date.getFullYear();
    else if (format == 'dd month yyyy')
      return date.getDate() + " " + this.FullMonth[date.getMonth()] + " " + date.getFullYear();
    else if (format == 'month dd,yyyy')
      return this.FullMonth[date.getMonth()] + " " + date.getDate() + "," + date.getFullYear();
    else
      return this.SortMonth[date.getMonth()] + "_" + date.getDate() + "_" + date.getFullYear();
  }//Format Date END;
  Plugin.prototype.EnableSorting = function (settings, element) {
    let _ = this;
    $('#' + element.attr('id') + '_report th').click(function () {
      $('#' + element.attr('id') + '_container').addClass('loading');
      let key_name = $(this).data('key');
      if ($(this).hasClass('asc')) {
        $('#' + element.attr('id') + '_report th').removeClass('asc').removeClass('desc');
        _.SortByKeyDesc(settings.data, key_name);
        $(this).addClass('desc');
      } else {
        $('#' + element.attr('id') + '_report th').removeClass('asc').removeClass('desc');
        _.SortByKey(settings.data, key_name);
        $(this).addClass('asc');
      }
      $('#' + element.attr('id') + '_report tbody').html('');

      if (settings.report_type == "lazy_load" || settings.report_type == "pagination") {
        _.controls.srow = 1;
        _.controls.erow = _.controls.paginationSize;
      } else {
        _.controls.srow = 1;
        _.controls.erow = settings.data.length;
      }
      _.AppendRows(settings, element)
      _.SetPagination(settings, element)
      $('#' + element.attr('id') + '_container').removeClass('loading');
      settings.callback.call(this);
    });
  }//Enable Sorting END;
  Plugin.prototype.SortByKey = function (array, key) {
    return array.sort(function (a, b) {
      var x = a[key]; var y = b[key];
      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
  }//sort by key end;
  Plugin.prototype.SortByKeyDesc = function (array, key) {
    return array.sort(function (a, b) {
      var x = a[key]; var y = b[key];
      return ((x > y) ? -1 : ((x < y) ? 1 : 0));
    });
  }//sort by key desc end; 
  Plugin.prototype.SetPagination = function (settings, element) {
    let _ = this;
    let act_page = Math.ceil(this.controls.current_position / this.controls.paginationSize), i;
    this.html = '<a href="javascript:void(0)" class="agile_prevset">&lt;&lt;</a><a href="javascript:void(0)" class="agile_prev">&lt;</a>';
    for (i = 1; i <= Math.ceil(settings.data.length / this.controls.paginationSize); i++) {
      if (i == act_page)
        this.html += `<a href="javascript:void(0)" class="active">${i}</a>`;
      else if (i > 3)
        this.html += `<a href="javascript:void(0)" class="agile_hide">${i}</a>`;
      else
        this.html += `<a href="javascript:void(0)">${i}</a>`;
    }
    this.html += '<a href="javascript:void(0)" class="agile_next">&gt;</a><a href="javascript:void(0)" class="agile_nextset">&gt;&gt;</a>';
    $('#' + element.attr('id') + '_pagination').html(this.html);
    if (i <= 4)
      $('#' + element.attr('id') + '_pagination a.agile_prevset,#' + element.attr('id') + '_pagination a.agile_nextset').remove();
    if ($('#' + element.attr('id') + '_pagination a').length == 3)
      $('#' + element.attr('id') + '_pagination a.agile_prev, #' + element.attr('id') + '_pagination a.agile_next').remove();
    $('#' + element.attr('id') + '_pagination a').click(function () {
      if ($(this).hasClass('agile_prev') || $(this).hasClass('agile_next') || $(this).hasClass('agile_nextset') || $(this).hasClass('agile_prevset'))
        return;
      let pno = $(this).text();
      $('#' + element.attr('id') + '_container').addClass('loading');
      _.controls.srow = ((pno - 1) * _.controls.paginationSize) + 1;
      _.controls.erow = _.controls.srow + _.controls.paginationSize - 1;
      $('#' + element.attr('id') + '_report tbody').html('');
      _.AppendRows(settings, element)
      $('#' + element.attr('id') + '_pagination a.active').removeClass('active');
      $(this).addClass('active');
      $('#' + element.attr('id') + '_container').removeClass('loading');
      settings.callback(_);
    });
    $('#' + element.attr('id') + '_pagination a.agile_prev').click(function () {
      let pno = Number($('#' + element.attr('id') + '_pagination a.active').text()) - 1;
      if ($('#' + element.attr('id') + '_pagination a.active').hasClass('agile_hide')) {
        pno = Number($('#' + element.attr('id') + '_pagination a:not([class*="agile_"])')[0].innerHTML);
      }
      if (pno == 0)
        return;
      $('#' + element.attr('id') + '_container').addClass('loading');
      _.controls.srow = ((pno - 1) * _.controls.paginationSize) + 1;
      _.controls.erow = _.controls.srow + _.controls.paginationSize - 1;
      $('#' + element.attr('id') + '_report tbody').html('');
      _.AppendRows(settings, element);

      if ($('#' + element.attr('id') + '_pagination a.active').hasClass('agile_hide')) {
        $('#' + element.attr('id') + '_pagination a.active:eq(0)').removeClass('active');
        $('#' + element.attr('id') + '_pagination a').each(function () {
          if ($(this).text() == pno)
            $(this).addClass('active');
        });
      } else {
        $('#' + element.attr('id') + '_pagination a.active').prev().addClass('active');
        $('#' + element.attr('id') + '_pagination a.active:eq(1)').removeClass('active');
        $('#' + element.attr('id') + '_pagination a').each(function () {
          if ($(this).text() == pno && $(this).hasClass('agile_hide')) {
            $(this).removeClass('agile_hide');
            $(this).next().next().next().addClass('agile_hide');
          }
        });
      }
      $('#' + element.attr('id') + '_container').removeClass('loading');
      settings.callback(_);
    });
    $('#' + element.attr('id') + '_pagination a.agile_next').click(function () {
      let pno = Number($('#' + element.attr('id') + '_pagination a.active').text()) + 1;
      if ($('#' + element.attr('id') + '_pagination a.active').hasClass('agile_hide')) {
        pno = Number($('#' + element.attr('id') + '_pagination a:not([class*="agile_"])')[0].innerHTML);
      }
      if (pno > Math.ceil(settings.data.length / _.controls.paginationSize))
        return;
      $('#' + element.attr('id') + '_container').addClass('loading');
      _.controls.srow = ((pno - 1) * _.controls.paginationSize) + 1;
      _.controls.erow = _.controls.srow + _.controls.paginationSize - 1;
      $('#' + element.attr('id') + '_report tbody').html('');
      _.AppendRows(settings, element);
      if ($('#' + element.attr('id') + '_pagination a.active').hasClass('agile_hide')) {
        $('#' + element.attr('id') + '_pagination a.active:eq(0)').removeClass('active');
        $('#' + element.attr('id') + '_pagination a').each(function () {
          if ($(this).text() == pno)
            $(this).addClass('active');
        });
      } else {
        $('#' + element.attr('id') + '_pagination a.active').next().addClass('active');
        $('#' + element.attr('id') + '_pagination a.active:eq(0)').removeClass('active');
        $('#' + element.attr('id') + '_pagination a').each(function () {
          if ($(this).text() == pno && $(this).hasClass('agile_hide')) {
            $(this).removeClass('agile_hide');
            $(this).prev().prev().prev().addClass('agile_hide');
          }
        });
      }
      $('#' + element.attr('id') + '_container').removeClass('loading');
      settings.callback(_);
    });
    $('#' + element.attr('id') + '_pagination a.agile_nextset').click(function () {
      let objarr = $('#' + element.attr('id') + '_pagination a:not([class*="agile_"])');
      let vpage = Number(objarr[objarr.length - 1].innerHTML);
      if (!vpage || vpage == Math.ceil(settings.data.length / _.controls.paginationSize))
        return;
      for (let i = 1; i <= 3; i++) {
        $('#' + element.attr('id') + '_pagination a').each(function () {
          if ($(this).text() == (vpage + i) && $(this).hasClass('agile_hide')) {
            $(this).removeClass('agile_hide');
            $(objarr[i - 1]).addClass('agile_hide');
          }
        });
      }
      settings.callback(_);
    });
    $('#' + element.attr('id') + '_pagination a.agile_prevset').click(function () {
      let objarr = $('#' + element.attr('id') + '_pagination a:not([class*="agile_"])');
      let vpage = Number(objarr[0].innerHTML);
      if (!vpage || vpage == 1)
        return;
      for (let i = 1; i <= 3; i++) {
        $('#' + element.attr('id') + '_pagination a').each(function () {
          if ($(this).text() == (vpage - i) && $(this).hasClass('agile_hide')) {
            $(this).removeClass('agile_hide');
            $(objarr[objarr.length - i]).addClass('agile_hide');
          }
        });
      }
      settings.callback(_);
    });
  }//Set Pagination END;
  Plugin.prototype.FilterReport = function (settings, element) {
    let _ = this;
    $('#' + element.attr('id') + '_input').bind("change paste keyup", function () {
      $('#' + element.attr('id') + '_container').addClass('loading');
      $('#' + element.attr('id') + '_report thead th').removeClass('asc').removeClass('desc');
    });
    // detect the change
    $('#' + element.attr('id') + '_input').bind("change paste keyup", delay(function (e) {
      let fval = $(this).val().toUpperCase();
      _.html = "";
      _.agile_data = [];
      if (fval.length > 0) {
        settings.data.forEach(function (val, i) {
          _.header_arr.forEach(function (ival, j) {
            _.temp = val[ival];
            if (_.temp.toString().toUpperCase().indexOf(fval) > -1) {
              _.agile_data.push(settings.data[i]);
              if (_.html.indexOf(val[ival]) == -1) {
                _.html = _.html + `<li>${val[ival]}</li>`;
              }
            }
          });//inner loop
        });//outer loop
        $('#' + element.attr('id') + '_container ul.agile_suggest').html(_.html);
        if ($('#' + element.attr('id') + '_input').is(":focus"))
          $('#' + element.attr('id') + '_container ul.agile_suggest').show();
        $('#' + element.attr('id') + '_container ul.agile_suggest li').click(function () {
          $('#' + element.attr('id') + '_input').val($(this).text());
        })
      } else {
        _.agile_data = settings.data;
      }
      _.controls.srow = 1;
      _.controls.erow = _.controls.paginationSize;
      $('#' + element.attr('id') + '_report tbody').html('');
      _.AppendRows(settings, element)
      _.SetPagination(settings, element)
      if (settings.report_type == "pagination" && _.agile_data.length == 0) {
        $('#' + element.attr('id') + '_wrapper .agile_bottom_tools').hide();
      } else {
        $('#' + element.attr('id') + '_wrapper .agile_bottom_tools').show();
      }
      if (_.agile_data.length == 0) {
        $('#' + element.attr('id') + '_report tbody').append(`<tr><td align="center" colspan="${_.header_arr.length}" style="font-size: 11px;color: #d40e0e;font-weight: bold;">No Matching Record !</td></tr>`);
      }
      $('#' + element.attr('id') + '_container').removeClass('loading');
      settings.callback(_);
    }, 700));
    $(document).mouseup(function () {
      $('#' + element.attr('id') + '_container ul.agile_suggest').hide();
    });
  }//Filter Report END;
  function delay(callback, ms) {
    var timer = 0;
    return function() {
      var context = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        callback.apply(context, args);
      }, ms || 0);
    };
  }//delay END;
  Plugin.prototype.destroy = function(settings, element){
    this.header_arr = [];
    this.html = '';
    this.temp = '';
    this.controls = {
      paginationSize: 0,
      srow: "",
      erow: "",
      current_position: ""
    }
    this.agile_data = [],
    //$('.agile_wrapper,.agile_wrapper *,.agile_down .excel,.agile_down .csv').off();
    element.html("");
  };
  // A really lightweight plugin wrapper around the constructor, 
  // preventing against multiple instantiations
  $.fn[pluginName] = function (options) {
    return this.each(function () {
      if (!$.data(this, 'plugin_' + pluginName)) {
        $.data(this, 'plugin_' + pluginName,
          new Plugin(this, options));
      }
    });
  }

})(jQuery, window, document);