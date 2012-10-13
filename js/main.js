$(function() {
	$.getJSON("lectures.json", function(data){
		loadLecture(data)
	})
})

function loadLecture(data) {
	$.each(data.lectures, function (i, lecture) {
		try {
			localStorage.setItem(i,JSON.stringify(lecture));
		} catch (e) {
			if (e == QUOTA_EXCEEDED_ERR) {
				console.error('Quota exceeded!');
			}
		}
		
	})
	generate(data);
}

function generate(data) {
	var markup = $('#template-week').html();
	template = Handlebars.compile(markup);

	$('#result').html(template(data))

}

Handlebars.registerHelper('tpldate', function() {
	var tpldate = new XDate(this.date);
	return tpldate.toString('d MMMM', 'ru');
});

XDate.locales['ru'] = {
    monthNames: ['Января','Февраля','Марта','Апреля','Мая','Июня','Июля','Августа','Сентября','Октября','Ноября','Декабря'],
    dayNamesShort: ['Пн','Вт','Ср','Чт','Пт','Сб','Вс']
};


//strip html tags.
//project = project.replace(/(<([^>]+)>)/ig, "");
//encode special characters.
// name = name.replace(/&/,"&amp;");
// name = name.replace(/</,"&lt;");
// name = name.replace(/>/,"&gt;");