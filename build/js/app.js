'use strict'

class weatherWebKitAPI{
    constructor(){
        this.main = document.querySelector('.main');
        this.input = document.querySelector('.header input')
        this.trigger = 0;
    }

    dateForApi(tr, ms){
        let trig = tr;
        let date = new Date(ms);
        if(trig === 0){
            return `${date.getDate().toString().padStart(2,0)}.${(date.getMonth()+1).toString().padStart(2,0)}.${date.getFullYear().toString()}`;
        }
        if(trig === 1){
            return `${date.getHours().toString().padStart(2,0)}:00`;
        }
        if(trig === 2){
            this.d = (date.getDate()+1).toString().padStart(2,0);
            this.dateToString(date.getDay(),date.getMonth());
            // console.log(date.getDay())
        }

    }
    dateToString(dNum,mNum){
        let dayArr =['SUN','MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        let mouArr =['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        this.dayStr = dayArr[dNum];
        this.mouStr = mouArr[mNum];
    }
    getCC(event){
        if(event.target.matches('.header .btn img') || event.target.matches('.header .btn')){
            let cc = document.querySelector('input').value;
            this.getCityCord(cc);
        }
    }
    getCCEnter(event){
        if(event.code === 'Enter'){
            let cc = document.querySelector('input').value;
            this.getCityCord(cc);
        }
    }

    getCityCord(cc){
        fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${cc}&limit=5&appid=f6669cef492d49360ce515d8d2ecf699`)
            .then(response => response.json())
            .then(response => {
                if(response.length >= 1){
                    let lat = response[0].lat;
                    let lon = response[0].lon;
                    this.getDataForAPI(lat, lon);
                    this.trigger = 1;
                }else{
                    this.generateError() // error check
                    this.trigger = 0;
                }
                
            })
    }

    nearCity(lan, lot){
        this.nearArr = []
        for(let i = 0; i < 4; i++){
           if(i === 0){
                this.nearFetch(lan -2, lot);
            }
           if(i === 1){
                this.nearFetch(lan+2, lot);
            }
            if(i === 2){
                this.nearFetch(lan, lot+2);
            }
            if(i === 3){
                this.nearFetch(lan, lot-2);
            }
        }
        
    }

    nearFetch(lat, lon){
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=f6669cef492d49360ce515d8d2ecf699`) // старое
                .then(response => response.json())
                .then(response => this.nearArr.push({name: response.name, ico: response.weather[0].icon, temp: response.main.temp, lat: lat, lon: lon}))
    }

    getDataForAPI(lat, lon){
        this.nearCity(lat, lon)
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=f6669cef492d49360ce515d8d2ecf699`) // старое
            .then(response => response.json())
            .then(response => this.weatherNow = [response.weather[0].icon, response.weather[0].main, response.main.temp, response.main.feels_like])

        fetch(`https://api.sunrisesunset.io/json?lat=${lat}&lng=${lon}`)
            .then(response => response.json())
            .then(response => this.timeNow = [response.results.sunrise, response.results.sunset, response.results.day_length])

        fetch(`https://api.openweathermap.org/data/2.5/forecast?&lat=${lat}&lon=${lon}&appid=f6669cef492d49360ce515d8d2ecf699`) // 5 дней 3 часа шаг
            .then(response => response.json())
            .then(response => {
                // console.log(response.list)
                this.weatherAll = []
                response.list.forEach(element => {
                    let obj = {
                        forecast: element.weather[0].main,
                        temp: Math.round(element.main.temp -273.15),
                        feelike: Math.round(element.main.feels_like -273.15),
                        wind: Math.round(element.wind.speed),
                        degW: element.wind.deg,
                        time: this.dateForApi(1, element.dt_txt),
                        timeM: element.dt_txt,
                        ico: element.weather[0].icon
                    }
                    this.weatherAll.push(obj);
                });
                
                console.log(this.weatherAll) // если убрать console.log то иногда дает ошибку(1 из 3 раз точно)
                console.log(this.nearArr)
                this.getFinalyArr(this.weatherAll)
            })
    }

    getFinalyArr(array){
        let i = 0;
        let FinalyArr = [];
        array.forEach((element, index) => {
            if(element.time === '00:00' && index !== 0){
                i++
                if(FinalyArr.length !== 5){
                    FinalyArr.push(index);
                }
            }
        });
        this.optionFinalyArr(array,FinalyArr)
    }

    optionFinalyArr(arr, arrNum){
        this.dayArr=[];
        let i = 0;;
        let mas = [];
        arr.forEach((element, index) => {
            if(index === arrNum[i]){
                this.dayArr.push(mas.reverse());
                mas = [];
                i++
                mas.push(element);
            }else{
                mas.push(element);
            }
        });
        // console.log(this.dayArr)
        setTimeout(this.generateToday(), 1000) // запуск первого тудей
    }

    generateError(){
        this.main.innerHTML = ''
        this.main.insertAdjacentHTML('afterbegin', `
        <div class="modal">
            <img src="pic/error.png" alt="">
            <h4>Qwerty cloud not be found.<br>Please enter a different location</h4>
        </div>
        `)
    }

    generateToday(){
        this.main.innerHTML = ''
        this.main.insertAdjacentHTML('afterbegin', `
        <div class="top">
        <div class="title">
            <h3>current weather</h3>
            <h3 class="date">${this.dateForApi(0, new Date())}</h3>
        </div>
        <div class="info">
            <div class="ico"><img src="pic/ico/${this.weatherNow[0]}.png" alt=""><p>${this.weatherNow[1]}</p></div>
            <div class="temp">
                <h6>${Math.round(this.weatherNow[2]-273.15)}*C</h6>
                <p>Real Feel ${Math.round(this.weatherNow[3]-273.15)}*</p>
            </div>
            <div class="time_point">
                <div><p>Sunrise:</p><p>${this.timeNow[0]}</p></div>
                <div><p>Sunset:</p><p>${this.timeNow[1]}</p></div>
                <div><p>Duration:</p><p>${this.timeNow[2]}</p></div>
            </div>
        </div>
    </div>
    <div class="middle">
        <h3>hourly</h3>
        <div class="info">
           <div class="icons">
                <h5>TODAY</h5>
           </div>
           <div class="content">
                <div class="item">
                    <p>Forecast</p>
                    <p>Temp (*C)</p>
                    <p>RealFeel</p>
                    <p>Wind (km/h)</p>
                </div>  
           </div>
        </div>
    </div>
    <div class="bottom">
        <div data-name = '${this.nearArr[0].name}'><p>${this.nearArr[0].name}</p><p><img src="pic/ico/${this.nearArr[0].ico}.png" alt=""> ${Math.round(this.nearArr[0].temp-273.15)}°C</p></div>
        <div data-name = '${this.nearArr[1].name}'><p>${this.nearArr[1].name}</p><p><img src="pic/ico/${this.nearArr[1].ico}.png" alt=""> ${Math.round(this.nearArr[1].temp-273.15)}°C</p></div>
        <div data-name = '${this.nearArr[2].name}'><p>${this.nearArr[2].name}</p><p><img src="pic/ico/${this.nearArr[2].ico}.png" alt=""> ${Math.round(this.nearArr[2].temp-273.15)}°C</p></div>
        <div data-name = '${this.nearArr[3].name}'><p>${this.nearArr[3].name}</p><p><img src="pic/ico/${this.nearArr[3].ico}.png" alt=""> ${Math.round(this.nearArr[3].temp-273.15)}°C</p></div>
    </div>
        `)

        this.generateInfo(0)
    }

    generateInfo(i){
       let n = document.querySelector('.middle')
       n.innerHTML = `<h3>hourly</h3>
       <div class="info">
          <div class="icons">
               <h5>TODAY</h5>
          </div>
          <div class="content">
               <div class="item">
                   <p>Forecast</p>
                   <p>Temp (°C)</p>
                   <p>RealFeel</p>
                   <p>Wind (km/h)</p>
               </div>  
          </div>
       </div>`
        this.dayArr[i].forEach(element => {
            document.querySelector('.content .item').insertAdjacentHTML('afterend', `
              <div class="item">
                    <p>${element.forecast}</p>
                    <p>${element.temp}°</p>
                    <p>${element.feelike}°</p>
                    <p>${element.wind}${this.deggWind(element.degW)}</p>
                </div>   
            `)
        });
        this.dayArr[i].forEach(element => {
            document.querySelector('.info .icons h5').insertAdjacentHTML('afterend', `
            <h5>${element.time} <img src="pic/ico/${element.ico}.png" alt=""></h5>  
            `)
        });
    }

    deggWind(d){
        switch(true){
            case (d <= 45 || d > 315): return 'N' 
            break;
            case (d <= 135 || d > 45): return 'E' 
            break;
            case (d <= 225 || d > 135): return 'S' 
            break;
            case (d <= 315 || d > 225): return 'W' 
            break;
        }
    }

    e(e){
        if(this.trigger === 1){if(e.target.matches('.pre_header .btn')){
            if(e.target.textContent === 'Today'){
                this.generateToday();
            }
            if(e.target.textContent === '5-day forecast'){
                this.generateForecast();
            }
        }}else{
            if(e.target.matches('input') || e.target.matches('.btn img')){

            }else{
                this.generateError();
            } 
        }
    }

    generateForecast(){
        this.main.innerHTML = ''
        this.main.insertAdjacentHTML('afterbegin', `
        <div class="days_block">
        </div>
        <div class="middle">
        <h3>hourly</h3>
        <div class="info">
           <div class="icons">
                <h5>TODAY</h5>
           </div>
           <div class="content">
                <div class="item">
                    <p>Forecast</p>
                    <p>Temp (°C)</p>
                    <p>RealFeel</p>
                    <p>Wind (km/h)</p>
                </div>  
           </div>
        </div>
    </div>
    
        `)
        // console.log(this.dayArr)
        this.daysBlgenerate(this.dayArr.reverse());
    this.generateInfo(0);
    }

    daysBlgenerate(arr){
        let num = [4,3,2,1,0]
        arr.forEach((element, index) => { 
            this.dateForApi(2, element[0].timeM)
            this.dateForApi(2, element[0].timeM)
            document.querySelector('.days_block').insertAdjacentHTML("afterbegin", `
        <div class="item" data-title ='${num[index]}'>
        <h3>${this.dayStr}</h3>
        <p>${this.mouStr} ${this.d}</p>
        <img src="pic/ico/09d.png" alt="">
        <h5>clear, warm</h5>   
        </div>
        `)
        });
        this.dayArr.reverse();
    }

    nearGo(event){
        if(event.target.matches('.bottom *')){
            this.getCityCord(event.target.getAttribute('data-name'));
            console.log(1);
        }
    }

    blockWeather(event){
        
        if(event.target.closest('.days_block .item')){
            this.generateInfo(event.target.closest('.days_block .item').getAttribute('data-title'));
        }
    }

    init(){
        // console.log(this.dateForApi(2, new Date()))
        document.addEventListener('click', this.blockWeather.bind(this));
        document.addEventListener('click', this.getCC.bind(this));
        this.input.addEventListener('keydown', this.getCCEnter.bind(this));
        document.addEventListener('click', this.e.bind(this));
        document.addEventListener('click', this.nearGo.bind(this));
    }
}

let start = new weatherWebKitAPI().init();