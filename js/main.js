$(function() {
	if (localStorage.length) {
		openLecture();
	} else {
    $.getJSON("lectures.json", function(data){loadLecture(data)});
  }
})

function loadLecture(data) {
	$.each(data.lectures, function (i, lecture) {
		try {
			localStorage.setItem('lecture-' + lecture.date + '-' + lecture.time.split(':')[0],JSON.stringify(lecture));
		} catch (e) {
			if (e == QUOTA_EXCEEDED_ERR) {
				console.error('Quota exceeded!');
			}
		}
	})
	generate(data);
}
function openLecture() {
	var lectures = [],
      data = {};
	for (var i = 0; i < localStorage.length; i++) {
    lectures.push(JSON.parse(localStorage.getItem(localStorage.key(i))));
	}
	data = {'lectures':lectures}
  generate(data);
}

function generate(data) {
	var lecture = $('#lecture').html(),
		day = $('#day').html(),
		tmp = '<tbody></tbody>',
		tbody = $(tmp),		
		result = '';


	template_lecture = Handlebars.compile(lecture);
	template_day = Handlebars.compile(day);
	$.each(data.lectures, function (i, lecture) {
		var date = XDate(lecture.date);
		var week = date.getWeek();

	
		if(tbody.has('#week_'+week).length) {
			createLecture(date,week,lecture)
		} else {
			//добавить неделю
			var days_in_week = '';
			var fullweek = $('<tr id="week_'+ week +'"></tr>');
			var month = date.getMonth();
			var year = date.getFullYear();
			var newweek = date.clone().setWeek(week,year);

			for (i=1;i<=7;i++) {
				var currentday = newweek.getDate();
				newdate = XDate(year,month,currentday).toString('d MMMM', 'ru');
				fullweek.append(template_day({'week':week,'day':i,'newdate':newdate}))
				newweek.addDays(1); 
			}					
			tbody.append(fullweek);

			createLecture(date,week,lecture);
		}
	})

	$('#result').append(tbody)

	function createLecture(date,week,lecture) {
		var numday = date.getDay();
		var day = tbody.find('#week_'+week+'_'+numday+' .calendar__day-date');
		if(day.hasClass('calendar__day-date_noevent')) {
			day.removeClass('calendar__day-date_noevent').addClass('calendar__day-date_hasevent');
		}
		tbody.find('#week_'+week+'_'+numday+'_lectures').append(template_lecture(lecture))
	}
}
Handlebars.registerHelper('lecture_id', function() {
	return 'lecture-' + this.date+'-'+this.time.split(':')[0];
});


XDate.locales['ru'] = {
    monthNames: ['Января','Февраля','Марта','Апреля','Мая','Июня','Июля','Августа','Сентября','Октября','Ноября','Декабря'],
    dayNamesShort: ['Пн','Вт','Ср','Чт','Пт','Сб','Вс']
};

function modalClean() {
  $('#editDialog .form-input').val('');
  $('#editDialog .form-checkbox').prop('checked',false)
}

function deleteLecture(id) {
  $('#'+id).remove();
  localStorage.removeItem(id);
}

function editLecture(id) {
  $('#currentId').val(id);
  $('#date').val(formatDateEdit($('#'+id+' .lectures__item__time').data('date')));
  $('#time').val($('#'+id+' .lectures__item__time').text());
  $('#title').val($('#'+id+' .lectures__item__link').text())
  $('#speaker-name').val($('#'+id).find('.lectures__item__speaker').text());
  $('#speaker-link').val($('#'+id).find('.lectures__item__speaker').attr('href'));
  $('#slides').val($('#'+id).find('.lectures__item__slides').attr('href'));
  $('#video').val($('#'+id).find('.lectures__item__video').attr('href'));
  $('#editDialog').modal();
}

function newLecture() {
  modalClean();
  $('#editDialog').modal();
}

function saveLecture() {
  var date=formatDate($('#date').val()),
      time=$('#time').val(),
      id = 'lecture-' + date + '-' + time.split(':')[0];
  var lecture = {
      'date':date,
      'time':$('#time').val(),
      'title':$('#title').val(),
      "speaker": {
          "name": $('#speaker-name').val(),
          "link":$('#speaker-link').val(),
      },
      "slides":$('#slides').val(),
      "video":$('#video').val(),
      "optional":$('#optional').prop('checked')      
  }
  $('')
  // Добавляем на страницу
  var lectures = [];
      lectures.push(lecture);
  var data = {'lectures':lectures}
      generate(data);

  // Сохраняем
  localStorage.setItem(id,JSON.stringify(lecture));

  //Костыль, лоханулся с айдишниками :(
  deleteLecture($('#currentId').val());

  $('#editDialog').modal('hide');
}


function exportLecture() {
    var lectures = [],
      data = {};
  for (var i = 0; i < localStorage.length; i++) {
    lectures.push(JSON.parse(localStorage.getItem(localStorage.key(i))));
  }
  $('#export').val('{lectures:'+JSON.stringify(lectures)+'}');
  $('#exportDialog').modal('show');
}
function formatDate(input) {
  var datePart = input.split('.'),
  day = datePart[0], month = datePart[1],year = datePart[2];
  return year+'-'+month+'-'+day;
}
function formatDateEdit(input) {
  var datePart = input.split('-'),
  day = datePart[2], month = datePart[1],year = datePart[0];
  return day+'.'+month+'.'+year;
}
/* =========================================================
 * bootstrap-modal.js v2.1.1
 * http://twitter.github.com/bootstrap/javascript.html#modals
 * =========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================= */


!function(a){"use strict";var b=function(b,c){this.options=c;this.$element=a(b).delegate('[data-dismiss="modal"]',"click.dismiss.modal",a.proxy(this.hide,this));this.options.remote&&this.$element.find(".modal-body").load(this.options.remote)};b.prototype={constructor:b,toggle:function(){return this[!this.isShown?"show":"hide"]()},show:function(){var b=this,c=a.Event("show");this.$element.trigger(c);if(this.isShown||c.isDefaultPrevented())return;a("body").addClass("modal-open");this.isShown=true;this.escape();this.backdrop(function(){var c=a.support.transition&&b.$element.hasClass("fade");if(!b.$element.parent().length){b.$element.appendTo(document.body)}b.$element.show();if(c){b.$element[0].offsetWidth}b.$element.addClass("in").attr("aria-hidden",false).focus();b.enforceFocus();c?b.$element.one(a.support.transition.end,function(){b.$element.trigger("shown")}):b.$element.trigger("shown")})},hide:function(b){b&&b.preventDefault();var c=this;b=a.Event("hide");this.$element.trigger(b);if(!this.isShown||b.isDefaultPrevented())return;this.isShown=false;a("body").removeClass("modal-open");this.escape();a(document).off("focusin.modal");this.$element.removeClass("in").attr("aria-hidden",true);a.support.transition&&this.$element.hasClass("fade")?this.hideWithTransition():this.hideModal()},enforceFocus:function(){var b=this;a(document).on("focusin.modal",function(a){if(b.$element[0]!==a.target&&!b.$element.has(a.target).length){b.$element.focus()}})},escape:function(){var a=this;if(this.isShown&&this.options.keyboard){this.$element.on("keyup.dismiss.modal",function(b){b.which==27&&a.hide()})}else if(!this.isShown){this.$element.off("keyup.dismiss.modal")}},hideWithTransition:function(){var b=this,c=setTimeout(function(){b.$element.off(a.support.transition.end);b.hideModal()},500);this.$element.one(a.support.transition.end,function(){clearTimeout(c);b.hideModal()})},hideModal:function(a){this.$element.hide().trigger("hidden");this.backdrop()},removeBackdrop:function(){this.$backdrop.remove();this.$backdrop=null},backdrop:function(b){var c=this,d=this.$element.hasClass("fade")?"fade":"";if(this.isShown&&this.options.backdrop){var e=a.support.transition&&d;this.$backdrop=a('<div class="modal-backdrop '+d+'" />').appendTo(document.body);if(this.options.backdrop!="static"){this.$backdrop.click(a.proxy(this.hide,this))}if(e)this.$backdrop[0].offsetWidth;this.$backdrop.addClass("in");e?this.$backdrop.one(a.support.transition.end,b):b()}else if(!this.isShown&&this.$backdrop){this.$backdrop.removeClass("in");a.support.transition&&this.$element.hasClass("fade")?this.$backdrop.one(a.support.transition.end,a.proxy(this.removeBackdrop,this)):this.removeBackdrop()}else if(b){b()}}};a.fn.modal=function(c){return this.each(function(){var d=a(this),e=d.data("modal"),f=a.extend({},a.fn.modal.defaults,d.data(),typeof c=="object"&&c);if(!e)d.data("modal",e=new b(this,f));if(typeof c=="string")e[c]();else if(f.show)e.show()})};a.fn.modal.defaults={backdrop:true,keyboard:true,show:true};a.fn.modal.Constructor=b;a(function(){a("body").on("click.modal.data-api",'[data-toggle="modal"]',function(b){var c=a(this),d=c.attr("href"),e=a(c.attr("data-target")||d&&d.replace(/.*(?=#[^\s]+$)/,"")),f=e.data("modal")?"toggle":a.extend({remote:!/#/.test(d)&&d},e.data(),c.data());b.preventDefault();e.modal(f).one("hide",function(){c.focus()})})})}(window.jQuery)