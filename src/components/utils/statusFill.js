const statusFill = (item) => {
  if (!item?.active) {
    return "#DEDEDE";
  }
  if (
    item?.reservations?.length &&
    !item?.reservations?.find((el) => el?.my_reservation)
  ) {
    return "#DEDEDE";
  }
  if (
    item?.reservations?.length &&
    item?.reservations?.find((el) => el?.my_reservation)
  ) {
    return "#C9E2FF";
  }
  if (!item?.reservations?.length) {
    return "#CEF0D6";
  }
};

export default statusFill;
