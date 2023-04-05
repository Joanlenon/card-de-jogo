((Tone) => {
	const audioSource = "https://assets.w23.fr/audio/Nyan-Cat-original.ogg";
	const dom = {
		img: document.getElementById("img"),
		meter: document.getElementById("meter"),
		scene: document.getElementById("scene"),
		button: document.getElementById("button")
	};
	const player = new Tone.Player({
			url: audioSource,
			loop: true,
			autostart: false,
			debug: true
		}).toDestination(),
		meter = new Tone.Meter(0.7);
	let colorString = "0, 0, 0",
		colorInterval = null,
		hue = 0;

	function loop() {
		const magicNumber = 50;
		const level = (magicNumber + meter.getValue()) * (100 / magicNumber);
		dom.img.style.transform = `scale(${
			(level - magicNumber) / (magicNumber / 4)
		})`;
		dom.img.style.filter = `hue-rotate(${hue}deg)`;
		dom.meter.style.width = `${level}%`;
		dom.scene.style.backgroundColor = `rgba(${colorString}, ${
			level / (100 + magicNumber)
		})`;
		if (player.state === "started") {
			requestAnimationFrame(loop);
		}
	} // loop

	function colorLoop() {
		let rgb = [];
		colorInterval = window.setInterval(() => {
			hue += 10;
			if (hue > 360) {
				hue = 0;
			}
			rgb = hslToRgb(hue, 0.6, 0.6);
			colorString = rgb.join(", ");
		}, 50);
		/* "HSL to RGB" from https://github.com/micro-js/hsl-to-rgb/blob/master/lib/index.js */
		function hslToRgb(h, s, l) {
			if (s === 0) return [l, l, l];
			h /= 360;
			let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			let p = 2 * l - q;
			return [
				Math.round(hueToRgb(p, q, h + 1 / 3) * 255),
				Math.round(hueToRgb(p, q, h) * 255),
				Math.round(hueToRgb(p, q, h - 1 / 3) * 255)
			];
		}
		function hueToRgb(p, q, t) {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p + (q - p) * 6 * t;
			if (t < 1 / 2) return q;
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		}
	} //ColorLoop

	// init
	// pre-warm audio resource before init, avoiding "AudioContext not allowed to start"
	new Tone.Buffer(audioSource, () => {
		player.connect(meter);
		dom.meter.classList = ["gain-meter"];
		dom.meter.style.width = "1%";
		dom.meter.innerHTML = "";
		dom.button.removeAttribute("aria-busy");
		dom.button.addEventListener("click", (e) => {
			if (player.state === "stopped") {
				player.start();
				e.target.innerHTML = "STOP ◼";
				document.body.style.animationDuration = "5s";
				colorLoop();
				loop();
			} else if (player.state === "started") {
				player.stop();
				e.target.innerHTML = "PLAY ►";
				document.body.style.animationDuration = "0s";
				clearInterval(colorInterval);
				cancelAnimationFrame(loop);
			}
		});
	});
})(Tone);
