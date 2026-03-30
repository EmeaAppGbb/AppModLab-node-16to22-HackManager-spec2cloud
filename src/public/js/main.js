/* ============================================
   HackManager — Client-Side JavaScript
   jQuery + Bootstrap 4 interactions
   ============================================ */

$(document).ready(function () {

  // --- Score range input live preview ---
  $('.score-range').on('input', function () {
    var displayId = $(this).data('display');
    $('#' + displayId).text($(this).val());
  });
  // Initialize score displays on page load
  $('.score-range').each(function () {
    var displayId = $(this).data('display');
    if (displayId) {
      $('#' + displayId).text($(this).val());
    }
  });

  // --- Delete confirmation dialog ---
  $('.delete-form').on('submit', function (e) {
    var confirmed = confirm('Are you sure you want to delete this? This action cannot be undone.');
    if (!confirmed) {
      e.preventDefault();
    }
  });

  // --- Registration form: confirm password match ---
  $('#registerForm').on('submit', function (e) {
    var password = $('#password').val();
    var confirmPassword = $('#confirm_password').val();
    if (password !== confirmPassword) {
      e.preventDefault();
      $('#confirm_password').addClass('is-invalid');
      return false;
    }
    $('#confirm_password').removeClass('is-invalid');
  });

  // Clear confirm-password error on typing
  $('#confirm_password').on('input', function () {
    if ($(this).val() === $('#password').val()) {
      $(this).removeClass('is-invalid');
    }
  });

  // --- Auto-dismiss flash messages after 5 seconds ---
  setTimeout(function () {
    $('.flash-message').alert('close');
  }, 5000);

  // --- Smooth scroll for anchor links ---
  $('a[href^="#"]').on('click', function (e) {
    var target = $(this.getAttribute('href'));
    if (target.length) {
      e.preventDefault();
      $('html, body').animate({
        scrollTop: target.offset().top - 70
      }, 500);
    }
  });

  // --- Active nav link highlighting ---
  var currentPath = window.location.pathname;
  $('.navbar-nav .nav-link').each(function () {
    var href = $(this).attr('href');
    if (href === currentPath || (href !== '/' && currentPath.indexOf(href) === 0)) {
      $(this).addClass('active');
    }
  });

});
