<template>
<div>
    <v-dialog v-model="isModalOpen" @click:outside="closeModal" width="auto">
        <v-card class="mx-auto" width="500">
            <template v-slot:title>
                <p style="font-size: 24px">{{`${selectedCityInfo.nome} - ${selectedCityInfo.municipio.microrregiao.mesorregiao.UF.nome}`}}</p>
                <p v-if="selectedCityInfo.nome != selectedCityInfo.municipio['regiao-imediata'].nome" style="font-size: 16px">{{`Área: ${selectedCityInfo.municipio['regiao-imediata'].nome}`}}</p>
            </template>
            <div class="d-flex justify-space-around">
                <div class="cities-search__temperature">
                    <span class="cities-search__temperature__number">{{roundedTemperature}}</span>
                    <span class="cities-search__temperature__symbol">C°</span>
                </div>
                <div class="d-flex flex-column align-center">
                    <img :src="weatherIcon" max-height="100" max-width="100">
                    <p>{{weatherDescription}}</p>
                </div>
            </div>

            <v-card-actions>
                <v-btn color="primary" block @click="closeModal">Fechar</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</div>
</template>

<script>
import {
    mapGetters,
    mapActions
} from 'vuex';
export default {
    name: 'weatherModal',
    props: {
        weatherDetails: {
            type: Object,
            default: {}
        },
        selectedCityInfo: {
            type: Object,
            default: {}
        }
    },
    computed: {
        ...mapGetters(['isModalOpen']),
        roundedTemperature() {
            return Math.round(this.weatherDetails.temp)
        },
        weatherIcon() {
            const urlIcon = `https://openweathermap.org/img/wn/${this.weatherDetails.weather[0].icon}@2x.png`
            return urlIcon
        },
        weatherDescription() {
            let description = this.weatherDetails.weather[0].description;

            let words = description.split(' ');

            for (let i = 0; i < words.length; i++) {
                words[i] = words[i][0].toUpperCase() + words[i].slice(1).toLowerCase();
            }

            return words.join(' ');
        }
    },
    methods: {
        ...mapActions(['toggleModal']),
        closeModal() {
            this.toggleModal(false);
        },
    },
}
</script>

<style lang="scss">
@media (max-width: 767px) {
  .v-card {
    width: 350px !important;
  }
}
</style>
