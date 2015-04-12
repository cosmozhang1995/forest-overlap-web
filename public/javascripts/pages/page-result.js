$(document).ready(function() {
	// $.getJSON('/api/test', function(json, textStatus) {
	// 	tableData(json);
	// });
	if (table_data) {
		for (var i = 0; i < table_data.length; i++) {
			var table_data_item = table_data[i];
			var table = tableData(table_data_item.data);
			var statisticsItem = statistics[table_data_item.name];
			var statisticsTable = new Table(formRecordTable(statisticsItem.records, statisticsItem.cols.names.length), {
				withHeader: true,
				firstHeader: true,
				cls: 'table table-bordered table-hover',
				id: 'data-table'
			});
			var elHtml = '<li role="presentation"><a href="#"><i class="fa fa-fw fa-remove"></i>' + table_data_item.name + '</a></li>';
			$(elHtml)
				.data('table', table)
				.data('table-records', statisticsTable)
				.data('name', table_data_item.name)
				.on('click', function(event) {
					event.preventDefault();
					$('#table-nav li').removeClass('active').each(function(index, el) {
						$(this).data('table').tableEl.detach();
						$(this).data('table-records').tableEl.detach();
					});;
					$(this).data('table').tableEl.appendTo('#table-container');
					$(this).data('table-records').tableEl.appendTo('#records-table-container');
					$('#cols').text(statisticsItem.cols.names.length);
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

function formRecordTable(records, n) {
	var table = [];
	var header_row = ['物种'];
	for (var i = 0; i < n; i++) {header_row.push('重要值'+(i+1));}
	header_row.push('合重要值');
	table.push(header_row);
	for (var k in records) {
		var row = [k];
		for (var i = 0; i < n; i++) row.push(records[k].advs[i]);
		row.push(records[k].adv);
		table.push(row);
	}
	return table;
}

function tableData(json) {
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