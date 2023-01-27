const Rating = theme => {
  return {
    MuiRating: {
      styleOverrides: {
        root: {
          color: theme.palette.warning.main,
          '& svg': {
            flexShrink: 0
          }
        },
        iconEmpty: {
          color: `rgba(${theme.palette.customColors.main}, 0.22)`
        }
      }
    }
  }
}

export default Rating
