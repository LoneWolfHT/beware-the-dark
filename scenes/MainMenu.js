var DO_AUDIO = true;
var music;

var difficulty = "Easy";

class MainMenu extends Phaser.Scene
{
	constructor()
	{
		super("MainMenu");
	}
	preload()
	{
		if (this.sys.game.device.audio.mp3)
			this.load.audio("music", "assets/mainmenu.mp3");
		else
		{
			console.log("Not loading audio. Device doesn't support any of our file types");
			DO_AUDIO = false;
		}

		this.load.image("lantern", "assets/lantern.png");
		this.load.image("tree1", ["assets/tree.png", "assets/tree_n.png"]);
		this.load.image("tree2", ["assets/tree2.png", "assets/tree2_n.png"]);
	}
	create()
	{
		let {width, height} = this.sys.game.canvas;

		// place trees
		for (let i = 0; i < width; i = i + random(25) + 25)
			this.add.image(i, height, "tree"+(random(2)+1)).setOrigin(0.5, 1).setScale(4, 4).setPipeline('Light2D');

		this.lights.addLight(500, 250, 0).setIntensity(0);
		this.lights.enable().setAmbientColor(0x444444);

		// Add menu items
		this.add.text(width/2, 16, "Beware the Dark", {fontFamily: "avara", fontSize: height/10, color: "#c60000"}).setOrigin(0.5, 0);

		var play = this.add.text(width/2, height/2.5, "Play", {fontFamily: "avara", fontSize: height/18, color: "#454545"}).setOrigin(0.5, 0.6).setInteractive();
		var difficultytext = this.add.text(width/2, (height/2.5) + height/11, "Difficulty: " + difficulty, {fontFamily: "avara", fontSize: height/18, color: "#454545"}).setOrigin(0.5, 0.6).setInteractive();

		var lantern = this.add.image(-16, -32, "lantern").setOrigin(1, 0.7).setScale(2, 2);
		var lantern2 = this.add.image(-32, -32, "lantern").setOrigin(0, 0.7).setScale(2, 2);

		play.on("pointerover", function on_textover() {
			this.play.setColor("#7f7f7f");
			lantern.setPosition((width/2) - play.displayWidth/1.9, play.y);
			lantern2.setPosition((width/2) + play.displayWidth/1.9, play.y);
		}, {play: play})

		play.on("pointerout", function on_textout() {
			this.play.setColor("#454545");
			lantern.setPosition(-16, -32);
			lantern2.setPosition(-32, -32);
		}, {play: play})

		play.on("pointerdown", function on_textpress() {
			music.stop();
			this.scene.start("DarkForest", {difficulty: difficulty});
		}, this)

		difficultytext.on("pointerover", function on_textover() {
			this.difficultytext.setColor("#7f7f7f");
			lantern.setPosition((width/2) - difficultytext.displayWidth/1.9, difficultytext.y);
			lantern2.setPosition((width/2) + difficultytext.displayWidth/1.9, difficultytext.y);
		}, {difficultytext: difficultytext})

		difficultytext.on("pointerout", function on_textout() {
			this.difficultytext.setColor("#454545");
			lantern.setPosition(-16, -32);
			lantern2.setPosition(-32, -32);
		}, {difficultytext: difficultytext})

		difficultytext.on("pointerdown", function on_textpress() {
			if (difficulty == "Easy")
				difficulty = "Medium";
			else if (difficulty == "Medium")
				difficulty = "Hard";
			else if (difficulty == "Hard")
				difficulty = "Easy";

			difficultytext.setText("Difficulty: " + difficulty);
			lantern.setPosition((width/2) - difficultytext.displayWidth/1.9, difficultytext.y);
			lantern2.setPosition((width/2) + difficultytext.displayWidth/1.9, difficultytext.y);
		}, {difficultytext: difficultytext})

		if (DO_AUDIO)
		{
			music = this.sound.add("music", {loop: true});

			music.play();
		}
	}
}

function random(max)
{
	return Math.floor(Math.random() * Math.floor(max));
}
