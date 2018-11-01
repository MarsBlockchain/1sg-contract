require 'json'
s = File.read(ARGV[0])

o = JSON.parse(s)
puts o["abi"].to_json
