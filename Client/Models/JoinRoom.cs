using System;
using System.ComponentModel.DataAnnotations;

namespace FreeTabletop.Models
{
    public class JoinRoom
    {
        [Required(
            ErrorMessage = "A Room Code is requried"
        )]
        [StringLength(
            6,
            MinimumLength = 6,
            ErrorMessage = "Invalid Room Code length"
        )]
        public string RoomCode { get; set; }
    }
}