$(document).ready(function() {
    // url to fetch films from backend
    const filmsUrl = 'http://localhost:3000/films'; 
    let currentFilmId;// variable to store currently selected film Id

    // Function to fetch films and load them into the list
    function loadFilms() {
        $.get(filmsUrl)// make a GET request for retrieving films
            .done((films) => {
                $('#films').empty();// clear existing film list
                films.forEach(film => {
                    // calculate tickets available
                    const availableTickets = film.capacity - film.tickets_sold;
                    // list item creation for each film
                    const filmItem = $(`
                        <li class="film item" data-id="${film.id}">
                            ${film.title}
                            <button class="ui red button delete-btn" style="float: right;">Delete</button>
                        </li>
                    `);
                    // add class of 'sold-out' if no tickets available
                    if (availableTickets === 0) {
                        filmItem.addClass('sold-out');
                    }
                    $('#films').append(filmItem);// append film item to list
                });
                loadFilmDetails(films[0]); // Load details for the first film
            });
    }

    // Function to load details of a selected film
    function loadFilmDetails(film) {
        const availableTickets = film.capacity - film.tickets_sold;// calculate available tickets
        // Update details section with film information
        $('#title').text(film.title);
        $('#runtime').text(`${film.runtime} minutes`);
        $('#film-info').text(film.description);
        $('#showtime').text(film.showtime);
        $('#poster').attr('src', film.poster);// set film poster image
        $('#ticket-num').text(availableTickets);//display tickets available
        $('#buy-ticket').prop('disabled', availableTickets === 0);// disable button if sold out
        $('#delete-film').show();//show delete button of selected film 
        currentFilmId = film.id;// store current film ID
    }

    // Load the films on page load
    loadFilms();

    // Handle film selection
    $('#films').on('click', '.film.item', function() {
        const filmId = $(this).data('id'); // Get ID of selected film
        $.get(`${filmsUrl}/${filmId}`).done(loadFilmDetails);// Fetch and load film details
    });

    // Buy ticket functionality
    $('#buy-ticket').click(function() {
        const filmId = currentFilmId;// Get currently selected film ID
        $.get(`${filmsUrl}/${filmId}`)
            .done((film) => {
                const updatedTicketsSold = film.tickets_sold + 1;// increment sold tickets
                // check for available tickets
                if (updatedTicketsSold <= film.capacity) {
                    $.ajax({
                        url: `${filmsUrl}/${filmId}`,
                        type: 'PATCH',
                        contentType: 'application/json',
                        data: JSON.stringify({ tickets_sold: updatedTicketsSold }), //update tickets sold in the backend
                    }).done(() => {
                        const newTicketsAvailable = film.capacity - updatedTicketsSold; // calculate new tickets available
                        $('#ticket-num').text(newTicketsAvailable); // update display
                        // if sold out update button text and disable it
                        if (newTicketsAvailable === 0) {
                            $('#buy-ticket').text('Sold Out').prop('disabled', true);
                            $(`#films .film.item[data-id="${filmId}"]`).addClass('sold-out');// mark film as sold out
                        }
                    });
                }
            });
    });

    // Delete film functionality
    $('#films').on('click', '.delete-btn', function() {
        const filmId = $(this).closest('.film.item').data('id');// GET ID of film to delete
        $.ajax({
            url: `${filmsUrl}/${filmId}`,
            type: 'DELETE', // DELETE request
        }).done(() => {
            $(this).closest('.film.item').remove();// remove film item from list
            // Hide film details if deleted film is selected
            if (currentFilmId === filmId) {
                $('#showing').hide(); // Hide showing info if the deleted film was selected
            }
        });
    });
});
  