var DO_AUDIO = true;
var music;

var WORLD_W = 5500;
var CAMERA;

var player, playerlight;
var GAME_OVER = false;
var STARTED_ENDGAME = false;

var monsters = [];

function reset_values()
{
	for (const obj of monsters)
		if (obj)
			obj.destroy();

	monsters = [];

	GAME_OVER = false;
	STARTED_ENDGAME = false;
	WORLD_W = 5500;
}

class DarkForest extends Phaser.Scene
{
	constructor()
	{
		super("DarkForest");
	}
	init(data)
	{
		if (data.difficulty == "Medium")
			WORLD_W *= 2;
		else if (data.difficulty == "Hard")
			WORLD_W *= 3;
	}
	preload()
	{
		if (this.sys.game.device.audio.mp3)
			this.load.audio("music_ingame", "assets/ingame.mp3");
		else
		{
			console.log("Not loading audio. Device doesn't support any of our file types");
			DO_AUDIO = false;
		}

		this.load.spritesheet("player", "assets/player.png", {frameWidth: 32, frameHeight: 32});
	
		this.load.image("monster", "assets/monster.png");
		this.load.image("house", ["assets/house.png", "assets/house_n.png"]);
		this.load.image("ground", ["assets/ground.png", "assets/ground_n.png"]);
		this.load.image("tree1", ["assets/tree.png", "assets/tree_n.png"]);
		this.load.image("tree2", ["assets/tree2.png", "assets/tree2_n.png"]);
	}
	create()
	{
		let {width, height} = this.sys.game.canvas;
		CAMERA = this.cameras.main;
		
		CAMERA.setOrigin(0.5, 1);
		
		this.lights.enable().setAmbientColor(0x111111);

		// place trees
		for (let i = 0; i < WORLD_W; i = i + random(50) + 30)
			this.add.image(i, height, "tree"+(random(2)+1)).setOrigin(0.5, 1).setScale(6, 8).setPipeline('Light2D');

		//ground
		var ground = this.physics.add.staticGroup();
		
		//ground floor
		ground.create(0, height, "ground").setOrigin(0, 1).setScale(WORLD_W/32, 1).refreshBody().setPipeline('Light2D');

		// World barrier
		ground.create(-32, height, "ground").setOrigin(1, 1).setScale(0.5, 5).refreshBody();

		// Add house at the end of the map
		this.lights.addLight(WORLD_W-32, height-32, 175).setIntensity(2);
		this.add.image(WORLD_W, height-16, "house").setScale(2, 2).setOrigin(1, 1).setPipeline('Light2D');

		//spawn tutorial text
		this.add.text(32, height-100, "A/D to move left/right.       Space to jump over hiding places", {fontFamily: "avara", fontSize: height/25, color: "#454545"}).setOrigin(0, 1);

		//spawn a few monsters
		for (let i = 500; i <= WORLD_W-564; i += random(340 - 224) + 224)
			monsters.push(this.physics.add.sprite(i, height-(random(2) == 0 ? 16 : 16+64), "monster").setOrigin(0.5, 1).setScale(2, 2).setMaxVelocity(250, 0));

		//spawn player
		player = this.physics.add.sprite(32, height-16, "player").setOrigin(0.5, 1).setScale(2, 2);
		playerlight = this.lights.addLight(48, height-16-32, 250).setIntensity(1);
		
		this.anims.create({
			key: "walking",
			frames: this.anims.generateFrameNumbers("player", {start: 0, end: 1}),
			frameRate: 3,
			repeat: -1,
		});

		this.anims.create({
			key: "standing",
			frames: this.anims.generateFrameNumbers("player", {start: 2, end: 2}),
			frameRate: 1,
			repeat: -1,
		});

		this.anims.create({
			key: "dead",
			frames: this.anims.generateFrameNumbers("player", {start: 3, end: 3}),
			frameRate: 1,
			repeat: -1,
		});
		
		player.body.setGravityY(1000);
		
		this.physics.add.collider(player, ground);

		player.anims.play("standing");

		if (DO_AUDIO)
		{
			music = this.sound.add("music_ingame", {loop: true, volume: 0.7});

			music.play();
		}
	}
	update(time, delta)
	{
		let {width, height} = this.sys.game.canvas;

		if (!player || !player.body)
			return;

		if (!GAME_OVER)
		{
			let a_key = this.input.keyboard.addKey("A");
			let d_key = this.input.keyboard.addKey("D");
			let space_key = this.input.keyboard.addKey("SPACE");

			if (player.x < WORLD_W - (width/2) && player.x > width/2)
				CAMERA.centerOnX(player.x);

			//make light follow player
			playerlight.x = player.x;

			if (a_key.isDown)
			{
				player.setVelocityX(-300);
				player.setFlipX(true);

				if (player.anims.currentAnim.key != "walking")
					player.anims.play("walking");
			}
			else if (d_key.isDown)
			{
				player.setVelocityX(300);
				player.setFlipX(false);

				if (player.anims.currentAnim.key != "walking")
					player.anims.play("walking");
			}
			else
			{
				if (player.anims.currentAnim.key == "walking")
				{
					player.setVelocityX(0);
					player.anims.play("standing");
				}
			}

			if (space_key.isDown && player.body.touching.down)
				player.body.setVelocityY(-400);
		}
		else if (!STARTED_ENDGAME)
		{
			STARTED_ENDGAME = true;
			this.add.text(player.x, height-128, "You misjudged the monster's location.\n...You won't make that mistake again", {fontFamily: "avara", fontSize: height/25, color: "#c60000"}).setOrigin(0.5, 1);
			this.time.delayedCall(5 * 1000, function() {
				music.stop();
				reset_values();
				this.scene.start("MainMenu");
			}, null, this)
		}
		
		for (const obj of monsters)
			if (Math.abs(player.x - obj.x) <= 256)
			{
				obj.setVisible(false);
				
				if (Math.sign(player.x - obj.x) >= 0)
				obj.setFlipX(true);
				else
				obj.setFlipX(false);
				
					if (obj.getCenter().distance(player.getCenter()) <= 38)
					{
						player.setVelocityX(0);
						player.anims.play("dead");
						playerlight.setIntensity(0.1);
						GAME_OVER = true;
					}
				}
				else
					obj.setVisible(true);

		if (!GAME_OVER && WORLD_W - player.x <= 20)
		{
			GAME_OVER = true;
			STARTED_ENDGAME = true;
			player.destroy();
			this.add.text(WORLD_W-16, height-128, "You made it home.\nYou will never stay out after dark again...", {fontFamily: "avara", fontSize: height/30, color: "#666666"}).setOrigin(1, 1);
			this.time.delayedCall(5 * 1000, function() {
				music.stop();
				this.scene.start("MainMenu");
				reset_values();
			}, null, this)
		}
	}
}

function random(max)
{
	return Math.floor(Math.random() * Math.floor(max));
}
