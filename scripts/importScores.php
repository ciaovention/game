#!/usr/bin/php
<?php

// Connect to MongoDB "games" database
$m = new Mongo('localhost');
$db = $m->game;
$gamesCol = new MongoCollection($db, 'games');
$playersCol = new MongoCollection($db, 'players');

$data_games = [];
$players = [];

// Define CSV file
$csv_file = './scores.csv';

if(!file_exists($csv_file))
	die("No scores file found!\n");

$csv_handle = fopen($csv_file, 'r');
$line = 0;

// Read CSV file and prepare the data to insert to DB
while (($data = fgetcsv($csv_handle, 5000, ',')) !== false) {
	if($line > 0){
		$player1 = strtolower($data[0]);
		$score1 = $data[1];
		$player2 = strtolower($data[2]);
		$score2 = $data[3];

		$data_games[] = [
			'player1' => $player1,
			'player2' => $player2, 
			'score' => $score1.':'.$score2,
			'date' => new MongoDate()
		];

		if(!isset($players[$player1])){
			$players[$player1] = ['score' => 0, 'count' => 0];
		}

		if(!isset($players[$player2])){
			$players[$player2] = ['score' => 0, 'count' => 0];
		}

		$players[$player1] = [
			'score' =>  $players[$player1]['score'] + $score1 - $score2,
			'count' => $players[$player1]['count']+1
		];

		$players[$player2] = [
			'score' =>  $players[$player2]['score'] + $score2 - $score1,
			'count' => $players[$player2]['count']+1
		];
	}
		
	$line++;
}

fclose($csv_handle);

// Batch insert games record
$gamesCol->batchInsert($data_games,['continueOnError' => true]);


// Update player's score
foreach ($players as $key => $player) {
	$query = ['name' => $key];
	$playerDoc = $playersCol->findOne($query);

	if(empty($playerDoc)){
		$playerDoc['score'] = 0;
		$playerDoc['count'] = 0;
	}

	$data = [
		'score' => (int)$player['score'] + $playerDoc['score'],
		'count' => (int)$player['count'] + $playerDoc['count']
	];

	$data['average'] = round($data['score'] / $data['count'], 2);

	$playersCol->update($query,['$set' => $data], ['multiple' => false, 'upsert' => true]);
}

echo "\nComplete import ". ($line - 1) ." records\n";

rename($csv_file, $csv_file.'.'.time().'.bk');