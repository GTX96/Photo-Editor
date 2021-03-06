$(document).ready(() => {
    
    const fadeTime = 300;

    //image element, default value
    let imageUploaded = true;
    let imageSrc = 'img/moto.jpg';
    let filename = 'img/moto.jpg';

    let activeEditor = $(".settings");
    let activeIconBar = $("#settingsBtn");

    //all sliders tools in basic edit
    const sliders = $('input[type=range]');

    //current preset filter
    let presetFilter = undefined;

    //crop object
    let cropper = undefined;
    let paint = undefined;
    let paintSaved = true;

    let canvasMode = 'caman';

    //INIT FUNCTION
    Caman('#canvas'); //create canvas from image
    resetAllSliders();
    resetTextInput();

    // Assign all panel animation to icon bar element
    $("#editBtn").click(() => {
        displayPanel($(".basic-edits"),$('#editBtn'));
    });

    $("#settingsBtn").click(() => {
        displayPanel($(".settings"),$('#settingsBtn'));
    });

    $("#filtersBtn").click(() => {
        displayPanel($(".filters-panel"),$('#filtersBtn'));
    });

    //*** PAINT AREA */

    //paint function
    $('#paintBtn').click(function(){
        //panel animation
        panelAnimation($(".paintArea"),$(this));

        let canvas = document.getElementById('canvas');

        //switch to nromal canvas
        canvasMode = 'normal';        

        //get current image on canvas
        let imageURL = canvas.toDataURL();

        //modified some canvas parameter
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight; 

        paint = new Paint(canvas,imageURL);
        paintSaved = false;

        paint.start();
        $('#paint-text').val('');
    })

    //on click on paint clear
    $('#paint-clear').click(function(){
        if(paint){
            $('#paint-text').val('');
            paint.clear();
        }
    });

    //on click on paint save
    $('#paint-save').click(function(){
        paintSaved = true;
        let e = new MouseEvent('click');
        document.getElementById('settingsBtn').dispatchEvent(e);
    })

    //on click on size of painting
    $('.paint-size').click(function(){
        if(paint){
            let size = $(this).attr('id').replace('paint-','');

            if(size == 'small'){
                paint.setBrushSize('4');
            }
            else if(size == 'medium'){
                paint.setBrushSize('12');
            }
            else if(size == 'normal'){
                paint.setBrushSize('18');
            }
            else if(size == 'large'){
                paint.setBrushSize('23');
            }
            else if(size == 'huge'){
                paint.setBrushSize('30');
            }
        }
        
    })

    //set color picker object
    $(".colorpicker").spectrum({
        showPaletteOnly: true,
        color: '#0000FF',
        palette: [
            ["#000","#444","#666","#999","#ccc","#eee","#f3f3f3","#fff"],
            ["#f00","#f90","#ff0","#0f0","#0ff","#00f","#90f","#f0f"],
            ["#f4cccc","#fce5cd","#fff2cc","#d9ead3","#d0e0e3","#cfe2f3","#d9d2e9","#ead1dc"],
            ["#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd"],
            ["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0"],
            ["#c00","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79"],
            ["#900","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47"],
            ["#600","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4c1130"]
        ]
    });

    //on change color on color picker
    $(".colorpicker").change(function(){
        if(paint){
            let type = $(this).attr('id').replace('-color','');
            let color = $(this).val();

            if(type == 'brush'){
                paint.setBrushColor(color);
            }
            else{
                paint.setTextColor(color)
            }
        }
    })

    //TEXT FILTER

    //on insert text to paint
    $('#paint-text').keyup(function(){
        let text = $(this).val();
        
        if(paint){
            paint.setText(text);
        }
    });

    //on change text size
    $('#paint-text-size').change(function(){        
        let size = $(this).val();

        if(paint){
            paint.setTextSize(size);
        }
    })

    //on change text font
    $('#paint-text-font').change(function(){
        let font = $(this).val();

        if(paint){
            paint.setTextFont(font);
        }
    })

    //on change text style
    $('#paint-text-style').change(function(){
        let style = $(this).val();

        if(paint){
            paint.setTextStyle(style);
        }
    })


    // ********* EDIT AREA

    //apply edit filter when a slider value change
    sliders.on('change',applyAllFilters);

    //on click on reset of edit tool element
    $(".element span").click(function(){
        let name = $(this).attr('id').replace('-rst','');
        
        //find the slider to change value
        for (let i = 0; i < sliders.length; i++) {
            const element = sliders[i];
            
            if(element.id === name){
                element.value = 0;
                break;
            }
        }

        //update edit filters
        applyAllFilters();
    });

    //slide down some panel area(crop,resize,ecc..)
    $(".slidepanel").click(function(){               
       //on slide down
       if($(this).css("border-bottom-color") != "rgb(46, 50, 56)"){
            $(this).css('border-bottom-color', '#2e3238');
       }
       else{
            $(this).css("border-bottom-color","rgb(160, 159, 159)");
       }

       //get id of area of the panel to slide
       let id_area = $(this).attr('id')+"-area";
       
        //slide effect
        $("#"+id_area).slideToggle();
    });

    //on click on resize button
    $("#resize-submit").click(function(){
        //get width and height value
        const width = parseInt($("#resize-width").val());
        const height = parseInt($("#resize-height").val());   
        
        if(isNaN(width) || isNaN(height) || width <= 0 || height <= 0){
            $("#resize-error").show();
        }
        else{            
            Caman("#canvas",function(){
                this.resize({
                    width: width,
                    height: height
                  });

                this.render();
                
                //hide possible error
                $("#resize-error").hide();
            });
        }
        
    });

    //on click on button reset of basic edits
    $('#resetEditBtn').click(() =>{
        resetAllSliders();
        applyAllFilters();
    });


    // PRESETS AREA

    //on click on preset filter
    $('.filter-container').click(function(){
        presetFilter = $(this).attr('id').replace('-filter','');
        applyAllFilters();

        //show remove button
        $('#filters-header-btn').css("visibility","visible");
    });

    //on click on remove preset filter
    $('#filters-header-btn').click(function(){
        presetFilter = undefined;
        applyAllFilters();

        //hide remove button
        $('#filters-header-btn').css("visibility","hidden");
    });

    // *********MANUAL TOOLS ************ 

    //on click on tools icon bar button
    $("#toolsBtn").click(function(){

        if(!paintSaved){
            const res = confirm('Do you want apply your Paint?');

            if(!res){
                $('#paint-clear').trigger('click');
            }
        }

        //hide icon bar and editor
        $('.editor').hide('fast',function(){
            $('.icon-bar').hide('fast',function(){
                
                //display tools buttons
                $(".manual-tools-area").fadeIn();

                let canvas = document.getElementById('canvas');

                cropper = new Cropper(canvas,{
                    ready(){
                        //remove the initial crop
                        this.cropper.clear();
                    },
                    dragMode: 'none',
                });
            });
        });
    });

    //zoom effects
    $('#zoomIn').click(function(){
        cropper.zoom(0.1);
    });

    $('#zoomOut').click(function(){
        cropper.zoom(-0.1);
    });

    //rotate effects
    $('#rotate-left').click(function(){
        cropper.rotate(-90);
    });

    $('#rotate-right').click(function(){
        cropper.rotate(90);
    });

    //moving effects
    $('#arrow-left').click(function(){
        cropper.move(-5, 0);
    });

    $('#arrow-right').click(function(){
        cropper.move(5, 0);
    });

    $('#arrow-up').click(function(){
        cropper.move(0, -5);
    });

    $('#arrow-down').click(function(){
        cropper.move(0, 5);
    });

    //drag and crop effects
    let dragMode = 'none';

    //on click on move button
    $('#move').click(function(){
        changeButtonColor($(this));

        if(dragMode == 'none' || dragMode == 'crop'){
            if(dragMode == 'crop'){
                changeButtonColor($('#crop'));
            }

            dragMode = 'move'
        }else{
            dragMode = 'none';
        }

        cropper.setDragMode(dragMode);
    });

    //on click on crop
    $('#crop').click(function(){
        changeButtonColor($(this));

        if(dragMode == 'none' || dragMode == 'move'){
            if(dragMode == 'move'){
                changeButtonColor($('#move'));
            }
            dragMode = 'crop'
        }else{
            dragMode = 'none';
        }

        cropper.setDragMode(dragMode);
    });
    
    //on click on crop button
    $('#apply-manual').click(function(){
        cropper.getCroppedCanvas().toBlob((blob) => {

            let url = URL.createObjectURL(blob);

            $('#canvas').replaceWith('<img id="canvas" src="" alt="">');

            $('#canvas').attr('src',url);

            hideCropArea();
            cropper.destroy();
        });
    });

    //on click on cancel on crop area
    $('#exit-manual').click(function(){
        hideCropArea();
        cropper.destroy();
    });

    //on click on reset tool button
    $('#reset-manual').click(function(){
        cropper.reset();
    });

    //SETTINGS AREA

    //on click on Choose Photo Button
    $("#file").change(() => uploadPhoto());

    //on click on reset photo
    $('#resetBtn').click(function(){
        $('#canvas').replaceWith('<img id="canvas" src="" alt="">');

        //update image src, with the file readed
        $("#canvas").attr("src",imageSrc);

        //create canvas from image uploaded
        Caman("#canvas");

        resetEditor();
    });

    //on click on save photo
    $('#saveBtn').click(function(){
        const filenames = filename.split('.');
        
        let newFileName = filenames[0]+"-edited.jpg";
                
        donwloadPhoto(newFileName);
    });
    
    //******* FUNCTIONS **************

    function resetEditor()
    {
        resetAllSliders();
        resetTextInput();

        presetFilter = undefined;
        $('#filters-header-btn').css("visibility","hidden");
    }

    function displayPanel(panel,icon){
        if(!paintSaved){
            const res = confirm('Do you want apply your Paint?');

            if(!res){
                $('#paint-clear').trigger('click');
            }
        }
       
        toCamanCanvas();
        panelAnimation(panel,icon);
        paintSaved = true;
    
    }

    function toCamanCanvas()
    {            
        if(canvasMode == 'normal')
        {
            let canvas = $('#canvas')[0];
            console.log("caman");

             //update canvas mode
            canvasMode = 'caman';

            let imageURL = canvas.toDataURL();

            //remove all listener
            $("#canvas").off();

            $('#canvas').replaceWith('<img id="canvas" src="" alt="">');

            //update image src, with the file readed
            $("#canvas").attr("src",imageURL);

            //create canvas from image uploaded
            Caman("#canvas");
        }   
    }

    function donwloadPhoto(filename)
    {
        let canvas = $('#canvas')[0];

        //create a link for download
        const link = document.createElement('a');

        link.download = filename;
        link.href = canvas.toDataURL('image/jpeg');

        //make a click on link created
        let e = new MouseEvent('click');
        link.dispatchEvent(e);
    }

    //change button color of move and crop tools button
    function changeButtonColor(toolsBtn)
    {
        if(toolsBtn.css('background-color') == 'rgb(1, 1, 153)'){
            toolsBtn.css('background-color','rgb(0,0,255)');
        }else{
            toolsBtn.css('background-color','rgb(1, 1, 153)');
        }
    }

    //hide the whole crop area
    function hideCropArea(){
        $('.manual-tools-area').hide(function(){
            $('.icon-bar').fadeIn();
        });

        $('.editor').fadeIn();
        activeEditor.fadeIn();

        //revert canvas to caman mode
        Caman('#canvas');
    }
    

    //set all sliders to default value
    function resetAllSliders(){
        sliders.each(function(){
            $(this).val(0);
        });
    }

    //set all text input to empty string
    function resetTextInput(){
        $("input[type=text]").each(function(){
            $(this).val("");
        })
    }

    //panel and icon bar animation
    function panelAnimation(newEditor,newIconBar){
        //hide old editor
        activeEditor.fadeOut(fadeTime,() => {
            //when animation finished...

            //show new editor
            newEditor.fadeIn();

            //update active icon bar
            activeIconBar.removeClass("active");
            newIconBar.addClass("active");

            //update the active editor and the active icon bar
            activeEditor = newEditor;
            activeIconBar = newIconBar;
        });
    }

    function uploadPhoto(){

        //get file
        const file = document.querySelector("#file").files[0];
    
        //init file reader
        const reader = new FileReader();
    
        if(file){
            //set filename
            filename = file.name;
    
            //read data as URL
            reader.readAsDataURL(file);
        }
    
        reader.addEventListener("load",() => {

            if(!imageUploaded){
                imageUploaded = true;
            }else{
                //if an image was already uploaded, remove the old canvas to replace with a new one
                $('#canvas').replaceWith('<img id="canvas" src="" alt="">');
            }

            //save source of image
            imageSrc = reader.result;

            //update image src, with the file readed
            $("#canvas").attr("src",imageSrc);

            //create canvas from image uploaded
            Caman("#canvas");

            resetEditor();
        });
    }


    const editFilters = [
        'brightness',
        'contrast',
        'saturation',
        'hue',
        'noise',
        'stackBlur',
        'exposure'
    ];

    function applyAllFilters(){
        Caman('#canvas',function(){
            ready =false;
            let canvas = this;

            canvas.revert(false);

            //apply resetFilter
            if(presetFilter){
                canvas[presetFilter]();
            }

            //apply all edit filters
            editFilters.forEach(function(filter){
                let val = parseInt($('#'+filter).val());

                if(val == 0){
                    return;
                }

                canvas[filter](val); //apply filters
                
            });

            canvas.render();
        });
    }
});