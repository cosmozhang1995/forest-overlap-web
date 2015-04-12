$(document).ready(function() {
	// $.getJSON('/api/test', function(json, textStatus) {
	// 	tableData(json);
	// });
	if (table_data) {
		for (var i = 0; i < table_data.length; i++) {
			var table_data_item = table_data[i];
			var table = tableData(table_data_item.data);
			var elHtml = '<li role="presentation"><a href="#"><i class="fa fa-fw fa-remove"></i>' + table_data_item.name + '</a></li>';
			$(elHtml)
				.data('table', table)
				.data('name', table_data_item.name)
				.on('click', function(event) {
					event.preventDefault();
					$('#table-nav li').removeClass('active').each(function(index, el) {
						$(this).data('table').tableEl.detach();
					});;
					$(this).data('table').tableEl.appendTo('#table-container');
					$(this).addClass('active');
				})
				.on('click', '.fa-remove', function(event) {
					event.preventDefault();
					event.stopPropagation();
					$(this).closest('li').data('table').tableEl.remove();
					$(this).closest('li').remove();
					$($('#table-nav li').get(0)).click();
				})
				.appendTo('#table-nav');
		};
		$($('#table-nav li').get(0)).click();

		$('#btn-clear-arrange').on('click', function(event) {
			event.preventDefault();
			$('#table-container').find('table.table').data('controller').clearArrange();
		});

		$('#btn-export').on('click', function(event) {
			event.preventDefault();
			exportData();
		});
	}
});

function tableData(json) {
	var availables_of_col = [];
	for (var i = 0; i < json[0].length; i++) availables_of_col.push(0);
	for (var i = 1; i < json.length; i++) {
		var data_row = json[i];
		for (var j = 0; j < data_row.length; j++) {
			var data_item = data_row[j];
			if (typeof data_item === "string" || typeof data_item === "number") availables_of_col[j]++;
			try {
				var parsed = parseFloat(data_item);
				if (!isNaN(parsed)) data_item = parsed;
			} catch (e) {}
			if ((typeof data_item === "number") && data_item.getMaxFixed) data_item = data_item.getMaxFixed(3);
		}
	}
	// var arrangeables_of_col = [];
	// for (var i = 0; i < availables_of_col.length; i++) 
	// 	arrangeables_of_col.push(availables_of_col[i] > 1);
	// var colOptions = [];
	// var unitOptions = [];
	// for (var i = 0; i < json[0].length; i++) {
	// 	colOptions.push({
	// 		arrangeable: arrangeables_of_col[i]
	// 	});
	// }
	// for (var i = 1; i < json.length; i++) {
	// 	var unitOptionsForRow = [];
	// 	for (var j = 0; j < json[i].length; j++) {
	// 		unitOptionsForRow.push({
	// 			fixed: !arrangeables_of_col[j]
	// 		});
	// 	}
	// 	unitOptions.push(unitOptionsForRow);
	// }
	return new Table(json, {
		withHeader: false,
		firstHeader: false,
		cls: 'table table-bordered',
		id: 'data-table'
	});
}

function exportData() {
	var data = [];
	$('#table-nav li').each(function(index, el) {
		data.push({
			name: $(this).data('name'),
			data: $(this).data('table').getData()
		});
	});
	data = JSON.stringify(data);
	$('#export-form #data-input').val(data).attr('value', data);
	$('#export-form').submit();
}