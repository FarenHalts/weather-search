<template>
<div>
    <v-table>
        <thead>
            <tr>
                <th class="text-left">
                    Cidade
                </th>
                <th class="text-left">
                    Id
                </th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(item, index) in filteredCities" :key="index" @click="$emit('citieHasClicked', item.id)">
                <td>{{ item.nome }}</td>
                <td>{{ item.id }}</td>
            </tr>
        </tbody>
    </v-table>

</div>
</template>

<script>
export default {
    name: 'citiesTable',

    props: {
        filteredCities: {
            type: Array,
            default: []
        }
    }
}
</script>
