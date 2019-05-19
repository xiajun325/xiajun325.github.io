const DEBUG = false;
const REPETITION_COUNT = 2; // number of times each pixel is assigned to a canvas
const NUM_FRAMES = 128;

/**
 * Generates the individual subsets of pixels that are animated to create the effect
 * @param {HTMLCanvasElement} ctx
 * @param {number} count The higher the frame count, the less grouped the pixels will look - Google use 32, but for our elms we use 128 since we have images near the edges
 * @return {HTMLCanvasElement[]} Each canvas contains a subset of the original pixels
 */

 // 转为base64图片
 function getBase64Image(img) {
     let canvas = document.createElement('canvas')
     canvas.width = img.width
     canvas.height = img.height
     let ctx = canvas.getContext('2d')
     ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
     let dataURL = canvas.toDataURL('image/png') // 可选其他值 image/jpeg
     return dataURL
 }


function generateFrames($canvas, count = 32) {
  const { width, height } = $canvas;
  const ctx = $canvas.getContext("2d");
  const originalData = ctx.getImageData(0, 0, width, height);
  const imageDatas = [...Array(count)].map(
    (_,i) => ctx.createImageData(width, height)
  );

  // assign the pixels to a canvas
  // each pixel is assigned to 2 canvas', based on its x-position
  for (let x = 0; x < width; ++x) {
    for (let y = 0; y < height; ++y) {
      for (let i = 0; i < REPETITION_COUNT; ++i) {
        const dataIndex = Math.floor(
          count * (Math.random() + 2 * x / width) / 3
        );
        const pixelIndex = (y * width + x) * 4;
        // copy the pixel over from the original image
        for (let offset = 0; offset < 4; ++offset) {
          imageDatas[dataIndex].data[pixelIndex + offset]
            = originalData.data[pixelIndex + offset];
        }
      }
    }
  }

  // turn image datas into canvas'
  return imageDatas.map(data => {
    const $c = $canvas.cloneNode(true);
    $c.getContext("2d").putImageData(data, 0, 0);
    return $c;
  });
}

/**
 * Inserts a new element over an old one, hiding the old one
 */
function replaceElementVisually($old, $new) {
  const $parent = $old.offsetParent;
  $new.style.top = `${$old.offsetTop}px`;
  $new.style.left = `${$old.offsetLeft}px`;
  $new.style.width = `${$old.offsetWidth}px`;
  $new.style.height = `${$old.offsetHeight}px`;
  $parent.appendChild($new);
  $old.style.visibility = "hidden";
}



/**
 * Disintegrates an element
 * @param {HTMLElement} $elm
 */
function disintegrate($elm) {
  var count = 0;
  html2canvas($elm, {
    allowTaint: false,
    useCORS: true,
    logging: true
  }).then($canvas => {
    // create the container we'll use to replace the element with
    const $container = document.createElement("div");
    $container.classList.add("disintegration-container");
    count++;
    console.log("update count: " + count);
  //  var animation2gif = new animation_gif($container, 33);
    // setup the frames for animation
    const $frames = generateFrames($canvas, NUM_FRAMES);
    $frames.forEach(($frame, i) => {
      $frame.style.transitionDelay = `${1.35 * i / $frames.length}s`;
      $container.appendChild($frame);
    //  gif.addFrame($frame, {delay: $frame.style.transitionDelay});
     // if (i >= NUM_FRAMES - 1)  {
     //    console.log("动画开始: " + i);
     //   $frame.addEventListener("transitionend", () => {
     //    animation2gif.stop();
     //   });
     // }
    });

    // then insert them into the DOM over the element
    replaceElementVisually($elm, $container);
    // then animate them
    $container.offsetLeft; // forces reflow, so CSS we apply below does transition
    if (!DEBUG) {
      // set the values the frame should animate to
      // note that this is done after reflow so the transitions trigger
      $frames.forEach($frame => {
        const randomRadian = 2 * Math.PI * (Math.random() - 0.5);
        $frame.style.transform =
          `rotate(${15 * (Math.random() - 0.5)}deg) translate(${60 * Math.cos(randomRadian)}px, ${30 * Math.sin(randomRadian)}px)
rotate(${15 * (Math.random() - 0.5)}deg)`;
			  $frame.style.opacity = 0;
        // gif.addFrame($frame, {delay: $frame.style.transitionDelay});
      });
    } else {
      $frames.forEach($frame => {
        $frame.style.animation = `debug-pulse 1s ease ${$frame.style.transitionDelay} infinite alternate`;
      });
    }

   //animation2gif.start()


  });
}

function animation_gif(tag, nRate) {
  var nIntervId;
  var stopped = false;

  var gif = new GIF({
    workers: 2,
    quality: 10,
    workerScript:'./gif.worker.js'
  });

   this.start = () => {
      console.log("start render():");
      stop = false;
      var framecount = 0;
         nIntervId = setInterval((tag) =>
         {
            framecount++;
            if (stop || framecount > 50) return;
            html2canvas(document.getElementsByName("body")[0]).then($canvas => {
               console.log("add ");
                gif.addFrame($canvas, {delay: nRate});
                //gif.render();
              //gif.addFrame($canvas.getContext("2d"), {copy: true});
            });
         } , nRate);
   };

   this.stop = function () {
       console.log("stop render():");
       stop = true;
        clearInterval(nIntervId);
        gif.on('finished', function(blob) {
          // 这里的blob就是gif图片blod格式信息
          window.open(URL.createObjectURL(blob));
        });
        gif.render();
      //
   };
}



/** === Below is just to bind the module and the DOM == */
[...document.querySelectorAll(".disintegration-target")].forEach($elm => {
  $elm.addEventListener("click", () => {
    if ($elm.disintegrated) { return; }
    $elm.disintegrated = true;
    disintegrate($elm);
  });
});

// (function() {
//   [...document.querySelectorAll(".disintegration-target")].forEach($elm => {
//       if ($elm.disintegrated) { return; }
//       $elm.disintegrated = true;
//       disintegrate($elm);
//   });
// })();

// (function(){
//   let imgs = document.querySelectorAll('img')
//   let count = 0 // 计数用
//      imgs = Array.from(imgs).filter(elem => {
//      return !/^data:image\/png;base64/.test(elem.src)
//    });
//
//    imgs.forEach((elem, index, arr) => {
//     let image = new Image()
//
//     //image.crossOrigin = '*' // 支持跨域图片
//     image.src = elem.src
//   //  image.setAttribute('crossOrigin', 'anonymous');
//     image.onload = () => {
//         elem.src = getBase64Image(image)
//         count++
//         console.log("imge download complete");
//       }
//     })
// })();
