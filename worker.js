/* jshint multistr: true */

onmessage = function(_e){
	var sample = _e.data.sample;
	var sampleRate = _e.data.sampleRate;
	var glide = 1E20;
	if(_e.data.glide != 0){glide = 1/_e.data.glide*40;}
	var p0 = _e.data.paramp;
	var p1 = _e.data.param;

	function shf256(_i){
		var a = [229, 158, 127, 162, 163, 133, 250, 59, 92, 174, 232, 76, 217, 149, 23, 12, 75, 172, 40, 47, 105, 8, 66, 141, 89, 53, 142, 82, 182, 41, 22, 249, 4, 234, 61, 239, 119, 176, 26, 132, 126, 201, 85, 204, 51, 230, 205, 235, 24, 189, 131, 36, 69, 156, 252, 20, 173, 135, 220, 44, 48, 140, 18, 57, 190, 9, 86, 14, 30, 118, 35, 116, 98, 170, 54, 90, 7, 113, 128, 157, 31, 96, 197, 114, 159, 167, 166, 49, 70, 139, 83, 42, 101, 245, 151, 63, 237, 103, 129, 15, 244, 183, 206, 43, 160, 242, 246, 238, 6, 181, 153, 110, 97, 2, 213, 207, 100, 130, 50, 120, 231, 73, 223, 225, 71, 136, 233, 21, 84, 102, 37, 144, 240, 138, 33, 221, 228, 226, 108, 212, 241, 117, 193, 243, 184, 175, 191, 3, 99, 17, 27, 178, 28, 45, 79, 93, 32, 16, 208, 107, 74, 56, 104, 194, 255, 179, 222, 134, 196, 202, 77, 203, 164, 218, 67, 123, 137, 5, 111, 87, 46, 80, 60, 187, 88, 81, 39, 195, 214, 122, 58, 177, 65, 64, 154, 10, 13, 185, 11, 115, 169, 19, 25, 72, 219, 125, 0, 198, 236, 34, 95, 224, 148, 150, 209, 68, 109, 62, 78, 254, 91, 171, 161, 210, 200, 247, 121, 155, 1, 253, 168, 186, 192, 215, 147, 38, 143, 216, 227, 248, 124, 188, 94, 251, 112, 52, 55, 211, 165, 145, 199, 106, 146, 29, 152, 180];
		return a[Math.floor(_i%256)];
	}
	function noise(_i){
		var sum = 0;
		for(var i=0; i<8; i++){
			var shfA = shf256(_i*Math.pow(2,i))/Math.pow(2,i+1);
			var shfB = shf256(_i*Math.pow(2,i)+1)/Math.pow(2,i+1);
			var pos = (_i*Math.pow(2,i))%1;
			sum += shfA*(1-pos) + shfB*(pos);
		}
		return sum/256;
	}
	function clamp(_i,_min,_max){
		return Math.min(Math.max(_i,_min),_max);
	}

	function makeFunc(_str){
		if(_str === ''){_str = '0';}
		eval('\
		var f = function(s){\
			var window, document, navigator, history, alert, prompt, console;\
			window = document = navigator = history = alert = prompt = console = null;\
			with(Math){\
				var t = s/sampleRate;\
				var p = p1+(p0-p1)*exp(-glide*t);\
				var x = max(p1*t-(p0-p1)*exp(-glide*t)/glide,0);\
				var rnd = Math.random();\
				try{\
					var ret = '+_str+';\
					return ret;\
				}catch(e){\
					return e;\
				}\
			}\
		};');
		return f;
	}

	var wave = new Float32Array(sample);
	var func = makeFunc(_e.data.func);
	if(!isNaN(func(0))){
		for(var i=0; i<sample; i++){
			wave[i] = func(i);
		}
		postMessage({error:false,wave:wave,c:_e.data.c,s:_e.data.s});
	}else{
		postMessage({error:String(func(0)),c:_e.data.c,s:_e.data.s});
	}
};
