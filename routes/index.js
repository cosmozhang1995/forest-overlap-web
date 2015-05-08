var express = require('express');
var router = express.Router();
var multipart = require('connect-multiparty');
var fs = require('fs');
var path = require('path');
var overlap = require('forest-overlap');

var multipartMiddleware = multipart();

function findTableCols(table) {
	var nNumsC = [];
	for (var r = 0; r < table.length; r++) {
		for (var c = 0; c < table[r].length; c++) {
			if (nNumsC[c] === undefined) nNumsC[c] = 0;
			if (!isNaN(parseFloat(table[r][c]))) nNumsC[c]++;
		}
	}
	var advs = [], names = [];
	for (var i = 1; i < nNumsC.length; i++) {
		if (nNumsC[i] > 3) advs.push(i);
	}
	for (var i = 0; i < advs.length; i++) {
		names.push(advs[i] - 1);
	}
	return {
		names: names,
		advs: advs
	};
}

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.post('/preview', multipartMiddleware, function(req, res) {
	var file = req.files.file;
	var limit_type = req.body.limit_type;
	var err = null;
	var table = null;
	var tableData = [];
	var stringifiedData = null;
	try {
		tableData = overlap.xlsx.parse(file.path);
		stringifiedData = JSON.stringify(tableData);
	} catch (e) {
		err = e;
	}
	res.render('preview', {
		// data: tableData,
		data: stringifiedData,
		error: err
	});
});

router.post('/result_direct', multipartMiddleware, function(req, res) {
	var file = req.files.file;
	var limit_type = req.body.limit_type;
	var limit = req.body.limit;
	var err = null;
	var table = null;
	var tableData = [];
	var stringifiedData = null;
	var statistics = {};
	var stringifiedStatistics = null;
	try {
		tableData = overlap.xlsx.parse(file.path);
	} catch (e) {
		err = e;
	}

	for (var i = 0; i < tableData.length; i++) {
		var tableItem = tableData[i],
			tableName = tableItem.name,
			table = tableItem.data,
			cols = findTableCols(table);
		var records = overlap.readData(table, cols.names, cols.advs);
		var arrangement = overlap.rankAdvantages(records);
		if (limit_type == "count") arrangement = arrangement.slice(0, parseInt(limit));
		else {
			for (var j = 0; j < arrangement.length; j++) {
				if (arrangement[j].adv < parseFloat(limit)) {
					arrangement = arrangement.slice(0, j);
					break;
				}
			}
		}
		var arrangementStatistics = arrangement;
		var newRecords = {};
		var statisticRecords = {};
		for (var j = 0; j < arrangement.length; j++) {
			var k = arrangement[j].name;
			newRecords[k] = records[k];
			statisticRecords[k] = {};
			statisticRecords[k].advs = records[k];
			statisticRecords[k].adv = arrangement[j].adv;
		}
		tableItem.data = overlap.formOverlapTable(overlap.overlapMatric(newRecords));

		statistics[tableName] = {
			cols: cols,
			// records: statisticRecords,
			table: overlap.formStatisticsTable(arrangementStatistics, {
				header_row: ['物种', 'Levins宽度', 'Hurlber宽度'],
				sortby: 'levinsWidth'
			})
		};
	}
	stringifiedData = JSON.stringify(tableData);

	res.render('result', {
		// data: tableData,
		data: stringifiedData,
		statistics: JSON.stringify(statistics),
		error: err
	});
});

module.exports = router;
