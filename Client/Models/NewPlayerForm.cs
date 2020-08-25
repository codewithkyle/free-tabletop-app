using System;
using System.ComponentModel.DataAnnotations;

namespace FreeTabletop.Client.Models
{
    public class NewPlayerForm
    {
        [Required(
            ErrorMessage = "A name is requried"
        )]
        [StringLength(
            32,
            ErrorMessage = "Names can not be longer than 32 characters"
        )]
        public string Name { get; set; }
    }
}