$(function() {
	$.getJSON("lectures.json", function(data){
		loadLecture(data)
	})
})

function loadLecture(data) {
	$.each(data.lectures, function (i, lecture) {
		try {
			localStorage.setItem(lecture.date+'-'+lecture.time.split(':')[0],JSON.stringify(lecture));
		} catch (e) {
			if (e == QUOTA_EXCEEDED_ERR) {
				console.error('Quota exceeded!');
			}
		}
		
	})
	generate(data);
}

function generate(data) {
	var lecture = $('#lecture').html(),
		day = $('#day').html(),
		tbody = $('<tbody></tbody>'),		
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
	return this.date+'-'+this.time.split(':')[0];
});


XDate.locales['ru'] = {
    monthNames: ['Января','Февраля','Марта','Апреля','Мая','Июня','Июля','Августа','Сентября','Октября','Ноября','Декабря'],
    dayNamesShort: ['Пн','Вт','Ср','Чт','Пт','Сб','Вс']
};
