const statusStroke = (item) => {
  if (!item?.active) {
    return "#8D8D8D";
  }
  if (
    item?.reservations?.length &&
    !item?.reservations?.find((el) => el?.my_reservation)
  ) {
    return "#8D8D8D";
  }
  if (
    item?.reservations?.length &&
    item?.reservations?.find((el) => el?.my_reservation)
  ) {
    return "#1C83FA";
  }
  if (!item?.reservations?.length) {
    return "#3BB856";
  }
};

export default statusStroke;
