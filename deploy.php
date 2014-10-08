#!/usr/bin/php
<?php

// Command line and input parameters
$options = getopt("c:p:e:h");

if (isset($options['h'])) {
	print "Usage: $prog [-c current commit/tag] [-p previous commit/tag] [-e environment]\n";
	print "User registration from US\n\n";
	print "Options:\n\n";
	print "  -c current commit/tag\n";
	print "  -p previous commit/tag\n";
	print "  -e environment 'beta' or 'live'\n";
	print "  -h  This menu\n\n";
exit;
}

$servers = [
	'beta' => 'beta-kagogo1.rhcloud.com',
	'live' => 'local-kagogo.rhcloud.com'];
$usernames = [
	'beta' => '53c6efe8500446192c00004b',
	'live' => '53c5750ce0b8cdf7b900039e'
];

$output = shell_exec("git diff --name-only {$options['c']} {$options['p']}");

echo "\n".$output."\n";

echo "Are you sure you want to deploy this?  Type 'yes' to continue: ";
$line = fgets(STDIN);
if(trim($line) != 'yes'){
    echo "ABORTING!\n";
    exit;
}

$output = explode("\n", $output);

$commands = [];

foreach($output as $file){
	if(!empty($file))
		$commands[] = "wget https://xueenda:83year.W@bitbucket.org/xueenda/kagogo/raw/stripe_payment/{$file} -O ./app-root/repo/{$file}";
}

$commands[] = "gear stop; gear start";

$connection = ssh2_connect($servers[$options['e']], 22, array('hostkey'=>'ssh-rsa'));

if (ssh2_auth_pubkey_file($connection, $usernames[$options['e']],
                          '/Users/exue/.ssh/id_rsa.pub',
                          '/Users/exue/.ssh/id_rsa')) {
  
} else {
  die("Public Key Authentication Failed\n");
}

foreach ($commands as $command) {
	echo $command."\n";
	$stream = ssh2_exec($connection, $command);
}

stream_set_blocking( $stream, true ); 
while($cmd = fread($stream,4096)){
	echo $cmd;
}
fclose($stream); 

echo "Done!\n";