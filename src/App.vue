<template>
<div class="cities-search">
    <v-container>
        <div class="cities-search__title-container">
            <span class="cities-search__title">Pesquisa de Clima em <span class="cities-search__title--colored-number">10.670</span> Distritos do Brasil</span>
        </div>
        <div class="d-flex align-center my-10">
            <v-img class="mx-auto mt-2" max-height="80" max-width="130" src="https://www.infoescola.com/wp-content/uploads/2008/02/IBGE.png"></v-img>
            <span style="font-size: 20px">+</span>
            <v-img class="mx-auto mt-2" max-height="80" max-width="130" src="https://seeklogo.com/images/O/openweather-logo-3CE20F48B5-seeklogo.com.png"></v-img>
        </div>
        <v-autocomplete v-model="selectedState" :items="allStates" item-title="nome" item-value="sigla" label="Pesquise um Estado" rounded />
        <div class="cities-search__filters" v-if="selectedState">
            <v-text-field label="Pesquise as Cidades" v-model="citieSearch"></v-text-field>
            <v-switch v-model="filterMethod" hide-details true-value="id" false-value="nome" :label="`Filtrar por: ${filterMethod}`" @click="getCitiesFromState(selectedState)"></v-switch>
        </div>
        <v-chip class="ma-2" color="deep-orange-darken-1" variant="outlined" size="large" text-color="white" v-if="selectedState">
            {{districtNumbers}}
        </v-chip>
        <cities-table v-if="selectedState" :filtered-cities="filteredCities" @citie-has-clicked="selectCity" />
    </v-container>
    <weather-modal :weather-details="weatherData" :selected-city-info="selectedCitieInformation" />
    <loading :active="isLoading" is-full-page loader="dots" />
</div>
</template>

<script>
import axios from 'axios'
import {
    mapGetters,
    mapActions
} from 'vuex';
import Cookies from 'js-cookie';

import citiesTable from './components/citiesTable.vue';
import WeatherModal from './components/weatherModal.vue';
import Loading from 'vue-loading-overlay';

import 'vue-loading-overlay/dist/css/index.css';

const API_KEY = '2f965749ef7c2e00d416e4e61ee78cf7';

export default {
    name: 'App',
    components: {
        citiesTable,
        WeatherModal,
        Loading
    },
    data() {
        return {
            allStates: [],
            selectedState: '',
            allCitiesState: [],
            filterMethod: 'nome',
            citieSearch: '',
            selectedCitieInformation: {},
            geolocationData: {},
            weatherData: {},
            isLoading: false
        }
    },
    mounted() {
        this.getAllStatesService()
        this.checkDialogOpen()
    },
    methods: {
        ...mapActions(['toggleModal']),
        async getAllStatesService() {
            try {
                const storedStates = Cookies.get('allStates')
                if (storedStates) {
                    this.allStates = JSON.parse(storedStates)
                } else {
                    const response = await axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
                    this.allStates = response.data
                    Cookies.set('allStates', JSON.stringify(this.allStates))
                }
            } catch (error) {
                alert('Erro ao obter estados:', error)
            }
        },
        async getCitiesFromState(state) {
            this.allCitiesState = [];
            try {
                const storedCities = localStorage.getItem(state);
                if (storedCities) {
                    this.allCitiesState = JSON.parse(storedCities);
                } else {
                    const response = await axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state}/distritos`)
                    this.allCitiesState = response.data
                    localStorage.setItem(state, JSON.stringify(this.allCitiesState));
                }
            } catch (error) {
                alert('Erro ao obter cidades:', error);
            }
        },
        async selectCity(cityId) {
            try {
                this.isLoading = true
                const response = await axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/distritos/${cityId}`)
                this.selectedCitieInformation = response.data[0]
                localStorage.setItem('selectedCitieInformation', JSON.stringify(this.selectedCitieInformation))
                this.requestGeolocationInformation()
            } catch (error) {
                alert('Erro ao obter cidades:', error)
                this.isLoading = false
            }
        },
        checkDialogOpen() {
            const modalValue = localStorage.getItem('isModalOpen') === 'true' ? true : false

            if (modalValue) {
                this.toggleModal(true);
                this.selectedCitieInformation = JSON.parse(localStorage.getItem('selectedCitieInformation'))
                this.weatherData = JSON.parse(localStorage.getItem('weatherData'))
            }
        },
        async requestGeolocationInformation() {
            try {
                const response = await axios.get(`http://api.openweathermap.org/geo/1.0/direct?q=${this.selectedCitieInformation.nome}&limit=5&appid=${API_KEY}`)
                this.geolocationData = {
                    'latitude': response.data[0].lat,
                    'longitude': response.data[0].lon
                }
                this.requestWeatherInformation()
            } catch (error) {
                alert(error)
                this.isLoading = false
            }
        },
        async requestWeatherInformation() {
            try {
                const response = await axios.get(`https://api.openweathermap.org/data/3.0/onecall?lat=${this.geolocationData.latitude}&lon=${this.geolocationData.longitude}&appid=${API_KEY}&lang=pt_br&units=metric&exclude=hourly,daily,alerts,minutely`)
                this.weatherData = response.data.current
                localStorage.setItem('weatherData', JSON.stringify(this.weatherData));
                this.isLoading = false
                this.toggleModal(true)
            } catch (error) {
                this.isLoading = false
            }
        },
        sortByName(cities) {
            return cities.slice().sort((a, b) => a.nome.localeCompare(b.nome));
        },
        sortById(cities) {
            return cities.slice().sort((a, b) => a.id - b.id);
        },
        filterBySearchTerm(cities, searchTerm) {
            return cities.filter(city =>
                city.nome.toLowerCase().includes(searchTerm) || city.id.toString().includes(searchTerm)
            );
        }
    },
    computed: {
        ...mapGetters(['isModalOpen']),
        filteredCities() {
            const {
                allCitiesState,
                filterMethod,
                citieSearch
            } = this;
            let filteredCities = [...allCitiesState];

            if (filterMethod === 'nome') {
                filteredCities = this.sortByName(filteredCities);
            } else if (filterMethod === 'id') {
                filteredCities = this.sortById(filteredCities);
            }

            if (citieSearch.trim() !== '') {
                filteredCities = this.filterBySearchTerm(filteredCities, citieSearch.trim().toLowerCase());
            }

            return filteredCities;
        },
        districtNumbers() {
            const pluralOrSingular = this.filteredCities.length == 1 ? ' Distrito' : ' Distritos'
            let districtQuantity = this.filteredCities.length + pluralOrSingular

            if (this.citieSearch) {
                districtQuantity += ' com o termo ' + this.citieSearch
            }

            return districtQuantity
        }
    },
    watch: {
        selectedState() {
            this.getCitiesFromState(this.selectedState);
        },
        isModalOpen() {
            localStorage.setItem('isModalOpen', this.isModalOpen);
        }
    }
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');

body {
    font-family: 'Roboto', sans-serif;
}

#app {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 30px;
}

.cities-search {
    &__title-container {
        display: flex;
        flex-direction: column;
    }

    &__title {
        color: #7091be;
        font-size: 32px;

        &--colored-number {
            color: #ec6d49;
        }
    }

    .v-container {
        max-width: 700px;
    }

    &__filters {
        display: flex;

        .v-input {
            width: 100%;
        }

        .v-switch {
            justify-items: center;
        }
    }

    &__temperature {
        display: flex;

        &__number {
            font-size: 90px;
        }

        &__symbol {
            margin-top: 22px;
            font-size: 30px;
        }
    }

    tr {
        cursor: pointer;

        td {
            text-align: left;
        }
    }
}
</style>
