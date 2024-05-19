let randomDoll;
let randomOtherItems;
let balls = [], started = false, prizeBall;
let $app, $machine, $handle, $balls, $title, $pointer;
let $$jitters = [];
let prize;
const SPEED = 1;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const addAnimClass = ($e, clazz, timing) => {
	const _func = $e => {
		$e.classList.add(clazz);
		$e.setAttribute('data-animate', '');
	}

	if (typeof $e === 'string') {
		[...document.querySelectorAll($e)].forEach(_func);
	} else {
		_func($e);
	}
}


        // Define the async function
        async function loadData() {
            try {
                const response = await fetch('./data/trim_data.xml');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const xmlText = await response.text();
                console.log(xmlText);
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
                const itemsList = extractItems(xmlDoc);
                console.log(itemsList);
                const { dollsList, otherItemsList } = filterItems(itemsList);
                
                // Generate random items
                const randomDoll = getRandomItems(dollsList, 1)[0];
                const randomOtherItems = getRandomItems(otherItemsList, 14);

                // Debug logs
                console.log('Random Doll:', randomDoll);
                console.log('Random Other Items:', randomOtherItems);

                // Extract values from dollsList and otherItemsList
                const dollValue = randomDoll.value;
                const otherValues = randomOtherItems.map(item => item.value);
                console.log('Random Doll value:', dollValue);
                console.log('Random Other vaules:', otherValues);

                // Display the values in the pool di
				console.log('Random Doll:', randomDoll);
				console.log('Random Other Items:', randomOtherItems);
				prize = getPrize(randomDoll,randomOtherItems);
				const firstDiv = document.getElementById('first')
                firstDiv.textContent = dollValue;
                const poolDiv = document.getElementById('pool');
                poolDiv.textContent = JSON.stringify(otherValues, null, 2);
				document.querySelector('.prize-container .prize img').src = prize.image
				console.log(prize)

            } catch (err) {
                console.error('Error:', err);
            }
        }



const init = async () => {
	$app = document.querySelector('#app');
	$app.classList.add('gotcha');
	loadData();
	const TITLE = '一番赏';
	const PRICE = '100星';

	$machine = document.querySelector('.machine-container');
	$handle = document.querySelector('.machine-container .handle');
	$balls = document.querySelector('.machine-container .balls');
	$title = document.querySelector('.title-container .title');
	$pointer = document.querySelector('.machine-container .pointer');

  $machine.querySelector('.title').innerHTML = [...TITLE].map(e => `<span>${e}</span>`).join('');
  $machine.querySelector('.price').innerText = PRICE;
  
	createBalls();

	gsap.set($machine, {
		y: '100vh'
	});

	gsap.set($title, {
		y: '120vh'
	});

	gsap.set($pointer, {
		opacity: 0
	});

	gsap.set('.prize-reward-container', {
		opacity: 0
	});

	setTimeout(prepare, 500 * SPEED);
}

const prepare = () => {
	let tl = gsap.timeline();

	tl.to($machine, {
		y: '0vh',
		ease: 'none',
		duration: 0.6,
		onComplete() {
			$handle.addEventListener('click', start, { once: true });

			balls.forEach(ball => {
				const tl = gsap.timeline();
				const duration = 0.05 + Math.random() * 0.1;

				tl.to(ball.dom, {
					y: -(10 + Math.random() * 10),
					ease: 'power1.out',
					duration,
				}).to(ball.dom, {
					y: 0,
					duration,
					ease: 'power1.in'
				});

				setTimeout(() => {
					if (!started) {
						showHint();
					}
				}, 2000 * SPEED);

			})
		}
	});
}

const start = async () => {
	started = true;
	hideHint();

	// handle spin and jitter
	await (() => new Promise(resolve => {
		const tl = gsap.timeline()
		tl.to($handle, {
			rotate: 90,
			duration: 0.3,
			ease: 'power1.in',
			async onComplete() {
				jitter();
				await delay(2000 * SPEED);
				await stopJittering();
				resolve();
			}
		}).to($handle, {
			rotate: 0,
			duration: 1,
		});
	}))();


	// ball drop
	await (() => new Promise(resolve => {
		const tl = gsap.timeline();
		gsap.to(prizeBall.dom, {
			x: '-3vh',
			ease: 'none',
			duration: 0.5,
			rotate: prizeBall.rotate + 10
		});

		gsap.to(balls[3].dom, {
			x: '1vh',
			y: '1vh',
			ease: 'none',
			duration: 0.5,
			rotate: balls[3].rotate - 5
		});

		gsap.to(balls[4].dom, {
			x: '-1vh',
			y: '1vh',
			ease: 'none',
			duration: 0.5,
			rotate: balls[4].rotate - 5
		});

		gsap.to(balls[5].dom, {
			x: '1vh',
			y: '1vh',
			ease: 'none',
			duration: 0.5,
			rotate: balls[5].rotate - 5
		});

		tl.to(prizeBall.dom, {
			y: '12vh',
			ease: 'power1.in',
			duration: 0.5
		}).to(prizeBall.dom, {
			y: '23vh',
			ease: 'power1.in',
			duration: 0.5
		}).to(prizeBall.dom, {
			y: '22vh',
			ease: 'power1.out',
			duration: 0.2
		}).to(prizeBall.dom, {
			y: '23vh',
			ease: 'power1.in',
			duration: 0.2
		}).to(prizeBall.dom, {
			y: '22.5vh',
			ease: 'power1.out',
			duration: 0.1
		}).to(prizeBall.dom, {
			y: '23vh',
			ease: 'power1.in',
			duration: 0.1,
			onComplete: resolve
		});
	}))();

	let shouldShowHint = true;
	prizeBall.dom.addEventListener('click', () => {
		shouldShowHint = false;
		hideHint();
		pickup();
	}, { once: true });

	await delay(2000);
	if(shouldShowHint) {
		showHint2();
	}
}

const pickup = () => {
	console.log('pick up');
	let { x, y } = prizeBall.dom.getBoundingClientRect();
	[x, y] = [x / window.innerHeight * 100, y / window.innerHeight * 100]; 
	document.querySelector('.prize-container .prize-ball-container').appendChild(prizeBall.dom);
	const rotate = prizeBall.rotate;
	prizeBall.x = 0;
	prizeBall.y = 0;
	prizeBall.rotate = 0;

	addAnimClass('.game-layer', 'dim')

	prizeBall.dom.style.left = 0;
	prizeBall.dom.style.top = 0;
	

	gsap.set(prizeBall.dom, {
		x: `${x}vh`,
		y: `${y}vh`,
		rotate,
		duration: 1
	});

	gsap.to('.prize-container .prize-ball-container', {
		x: `-4vh`,
		y: `-4vh`,
		duration: 1
	});

	let tl = gsap.timeline();
	tl.to(prizeBall.dom, {
		x: '50vw',
		y: '50vh',
		scale: 2,
		rotate: -180,
		duration: 1
	}).to(prizeBall.dom, {
		duration: 0.1,
		scaleX: 2.1,
		ease: 'power1.inOut',
		scaleY: 1.9
	}).to(prizeBall.dom, {
		duration: 0.1,
		ease: 'power1.inOut',
		scaleX: 1.9,
		scaleY: 2.1
	}).to(prizeBall.dom, {
		duration: 0.1,
		ease: 'power1.inOut',
		scaleX: 2.1,
		scaleY: 1.9
	}).to(prizeBall.dom, {
		duration: 0.1,
		ease: 'power1.inOut',
		scaleX: 1.9,
		scaleY: 2.1
	}).to(prizeBall.dom, {
		duration: 0.1,
		ease: 'power1.inOut',
		scaleX: 2.1,
		scaleY: 1.9
	}).to(prizeBall.dom, {
		duration: 0.1,
		ease: 'power1.inOut',
		scaleX: 1.9,
		scaleY: 2.1
	}).to(prizeBall.dom, {
		duration: 0.5,
		ease: 'power1.out',
		scaleX: 2.6,
		scaleY: 1.6
	}).to(prizeBall.dom, {
		duration: 0.1,
		ease: 'power1.out',
		scaleX: 1.6,
		scaleY: 2.4,
		onComplete: pop
	}).to(prizeBall.dom, {
		duration: 0.1,
		ease: 'power1.out',
		scaleX: 2.1,
		scaleY: 1.9,
	}).to(prizeBall.dom, {
		duration: 0.1,
		ease: 'power1.out',
		scaleX: 2,
		scaleY: 2
	});
}

const pop = () => {
	gsap.set('.prize-reward-container .prize', {
		scale: 0
	});

	gsap.to('.prize-reward-container', {
		opacity: 1,
		duration: 0.3
	});

	gsap.to('.prize-reward-container .prize', {
		scale: 1,
		duration: 0.5,
		ease: 'back.out'
	});

	gsap.to(prizeBall.dom, {
		opacity: 0
	});

	gsap.set($title, {
		y: '-50vh',
	});

	$title.children[0].innerHTML = `你抽到了一个 <br>${prize.title}`;
	gsap.to($title, {
		delay: 1,
		y: '5vh',
		duration: 0.6
	});

	gsap.to($machine, {
		y: '100vh',
		duration: 1,
		delay: 1,
		onComplete() {
			$machine.remove();
		}
	});
	document.addEventListener('click', goBack, { once: true });
}

const goBack = () => {
    // 刷新页面
    location.reload();
}

const showHint = () => {
	gsap.to($title, {
		y: '80vh',
		duration: 0.6
	});

	gsap.to($pointer, {
		opacity: 1,
		duration: 1
	});
}

const hideHint = () => {
	gsap.to($title, {
		y: '120vh',
		duration: 0.6
	});

	gsap.to($pointer, {
		opacity: 0,
		duration: 1
	});
}

const showHint2 = () => {
	$title.children[0].innerHTML = '点击拿取扭蛋!';
	gsap.set($pointer, {
		x: '16vh',
		y: '3vh'
	});

	gsap.to($title, {
		y: '80vh',
		duration: 0.6
	});

	gsap.to($pointer, {
		opacity: 1,
		duration: 1
	});
}

const createBalls = () => {
	let id = 0;
	const createBall = (x, y, rotate = ~~(Math.random() * 360), hue = ~~(Math.random() * 360)) => {
		const size = 8;
		const $ball = document.createElement('figure');
		$ball.classList.add('ball');
		$ball.setAttribute('data-id', ++id);
		$ball.style.setProperty('--size', `${size}vh`);
		$ball.style.setProperty('--color1', `hsl(${hue}deg, 80%, 70%)`);
		$ball.style.setProperty('--color2', `hsl(${hue + 20}deg, 50%, 90%)`);
		$ball.style.setProperty('--outline', `hsl(${hue}deg, 50%, 55%)`);
		
		$balls.appendChild($ball);

		const update = () => {
			gsap.set($ball, {
				css: {
					left: `calc(${x} * (100% - ${size}vh))`,
					top: `calc(${y} * (100% - ${size}vh))`,
					transform: `rotate(${rotate}deg)`
				},
			});
		}

		const ball = {
			dom: $ball,
			get x() {
				return x;
			},
			get y() {
				return y;
			},
			get rotate() {
				return rotate;
			},
			set x(value) {
				x = value;
				update();
			},
			set y(value) {
				y = value;
				update();
			},
			set rotate(value) {
				rotate = value;
				update();
			},
			get size() {
				return size;
			}
		};

		balls.push(ball);

		update();

		return ball;
	}
	createBall(0.5, 0.6);
	createBall(0.1, 0.68);
	createBall(0.3, 0.65);
	createBall(0.7, 0.63);
	createBall(0.96, 0.66);

	createBall(0.75, 0.79);
	createBall(0.5, 0.8);
	prizeBall = createBall(0.9, 0.81);
	createBall(0.05, 0.82);

	createBall(1, 0.9);
	createBall(0.25, 0.9);

	createBall(0.9, 1);
	createBall(0.4, 1);
	createBall(0.65, 1);
	createBall(0.09, 1);
}

const jitter = () => {
	balls.forEach(({ dom, rotate }, i) => {
		const tl = gsap.timeline({ repeat: -1, delay: -i * 0.0613 });

		gsap.set(dom, {
			y: 0,
			rotateZ: rotate,
		})

		const duration = Math.random() * 0.1 + 0.05;

		tl.to(dom, {
			y: -(Math.random() * 6 + 2),
			rotateZ: rotate,
			duration,
		}).to(dom, {
			y: 0,
			rotateZ: rotate - Math.random() * 10 - 5,
			duration,
		});

		$$jitters.push(tl);
	});

	const tl = gsap.timeline({ repeat: -1 });
	tl.to('.machine-container', {
		x: 2,
		duration: 0.1
	}).to('.machine-container', {
		x: 0,
		duration: 0.1
	});

	$$jitters.push(tl);
}

const stopJittering = async () => {
	$$jitters.forEach($$jitter => $$jitter.pause());

	balls.forEach(({ dom, rotate }, i) => {
		gsap.to(dom, {
			y: 0,
			rotate,
			duration: 0.1
		})
	});

	gsap.to('.machine-container', {
		x: 0,
		duration: 0.1
	});

	await delay(200);
}


function getPrize(randomDoll,randomOtherItems){
    const lotteryResult = performLottery(randomDoll, randomOtherItems);
    console.log("Lottery Result:", lotteryResult);
	// lotteryResult.image =  "https://wiki.biligame.com/qqlove/%E6%96%87%E4%BB%B6:" + lotteryResult.title;
    return lotteryResult;
}



// Function to extract items from parsed XML
function extractItems(xmlDoc) {
    const names = xmlDoc.getElementsByTagName('name');
    const itemsList = [];
	let img;
    for (let i = 0; i < names.length; i++) {
        const name = names[i];
        const value = name.getAttribute('value');
        const type = name.getElementsByTagName('type')[0]?.textContent || null;
        const img_full = name.getElementsByTagName('img')[0]?.textContent || null;
		var index = img_full.indexOf('/150px');
		if (index !== -1) {
            img = img_full.slice(0, index);}
		else{
		    img = img_full
		}
		itemsList.push({ value, type, img });
    }
    return itemsList;
}

// Function to filter items into two lists
function filterItems(itemsList) {
    const dollsList = itemsList.filter(item => item.type === "玩偶");
    const otherItemsList = itemsList.filter(item => item.type !== "玩偶");
	console.log(otherItemsList)
	console.log(dollsList)
    return { dollsList, otherItemsList };
}

// Function to get random items from a list
function getRandomItems(list, count) {
    const shuffled = list.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Function to perform the lottery with given probabilities
function performLottery(doll, otherItems) {
    const randomValue = Math.random();
	console.log("perform",otherItems)
    let selectedItem;
    if (randomValue < 0.02) {
        selectedItem = doll;
    } else {
        const otherIndex = Math.floor(Math.random() * 14);
        selectedItem = otherItems[otherIndex];
    }
	console.log(selectedItem)
    return {
        image: selectedItem.img,
        title: selectedItem.value
    };
}



init();


document.addEventListener("DOMContentLoaded", function() {
	var firstElement = document.getElementById("first");
	var otherElement = document.getElementById("pool");

	if (firstElement.textContent && otherElement.textContent) {
		var popup = document.getElementById("popup");
		popup.querySelector(".first").textContent = firstElement.textContent;
		popup.querySelector(".other").textContent = otherElement.textContent;
		popup.style.display = "block";
		
		setTimeout(function() {
			popup.style.display = "none";
		}, 3000); // 3 seconds
	}
});