extends Node2D

var window
var provider
var console
var contract
var signer
var Json = JSON.new()
var logs
var connect_sequence: Sequence
var _ethers

# res://web3.html

func _ready() -> void:
	print("readys")
	loaded()

func loaded():
	if OS.has_feature("web"):
		#window = JavaScriptBridge.get_interface('window')
		#var javascript_code = """
			#window.current_provider = MMSDK.getProvider();
		#"""
		#JavaScriptBridge.eval(javascript_code);
		#provider = JavaScriptBridge.get_interface("current_provider");
		#console = window.console
		#console.log(provider)
		window = JavaScriptBridge.get_interface('window')
		_ethers = JavaScriptBridge.get_interface("ethers")
		var javascript_code = """
			window.current_provider = new ethers.BrowserProvider(window.ethereum);
		"""
		JavaScriptBridge.eval(javascript_code);
		provider = JavaScriptBridge.get_interface("current_provider");
		console = window.console

func delete_globals(varname:String):
	JavaScriptBridge.eval("delete window.%s;"%(varname))

func create_big_obj(dicts: Dictionary):
	var s = "{ "
	for i in dicts.keys():
		var value = dicts[i]
		match typeof(value):
			TYPE_STRING:
				if value.replace("n", "").is_valid_int(): # big number
					s += ('%s : %s, '%[i, value])
				else:
					s += ('%s : "%s", '%[i, value])
			TYPE_NIL:
				s += ('%s : %s, '%[i, value]).replace("<null>", "null")
			_:
				s += ('%s : %s, '%[i, value])
		
	s = s.substr(0, s.length()-2)
	s += " }"
	return s

func create_jsobj(dicts: Dictionary):
	var s = create_big_obj(dicts)
	var javascript_code = """
	window.result = %s
	"""%[s]
	JavaScriptBridge.eval(javascript_code)
	var result = window.result
	delete_globals("result")
	return result

func connect_wallet():
	connect_sequence = Sequence.new(func(s): print(s); window.console.log(provider._metamask.isUnlocked()), func(): window.console.log(provider._metamask.isUnlocked()))
	#connect_sequence.update(set_accounts)
	connect_sequence.runasynic(
		window.ethereum.request(
			create_jsobj({"method": "eth_requestAccounts"})
		)
	)
	print(9)
	
	pass
